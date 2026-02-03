/**
 * Fixtures Sync Worker
 *
 * Synchronizes fixtures from football-data.org into the database.
 * Fetches fixtures per active league + season (REQUIRED by football-data.org).
 */

import { footballDataClient } from "../ingestion/sources/football-data-org";
import { syncLogger } from "../ingestion/utils/sync-logger";
import { getDb } from "../db";
import {
  fixtures,
  leagues,
  seasons,
  teams,
  venues,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Map internal league → football-data.org competition code
 * Adjust if you add more leagues.
 */
function getCompetitionCode(leagueName: string): string | null {
  const map: Record<string, string> = {
    "Premier League": "PL",
    "La Liga": "PD",
    "Serie A": "SA",
    "Bundesliga": "BL1",
    "Ligue 1": "FL1",
    "Champions League": "CL",
  };

  return map[leagueName] ?? null;
}

export async function syncFixtures() {
  const context = syncLogger.startSync("fixtures-sync");

  try {
    console.log("[fixtures-sync] Starting fixtures synchronization...");

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 1. Get active seasons with their leagues
    const activeSeasons = await db
      .select({
        season: seasons,
        league: leagues,
      })
      .from(seasons)
      .innerJoin(leagues, eq(seasons.leagueId, leagues.id))
      .where(eq(seasons.current, true));

    if (activeSeasons.length === 0) {
      console.log("[fixtures-sync] No active seasons found");
      return {
        success: true,
        log: syncLogger.endSync(context, "football-data.org"),
      };
    }

    console.log(
      `[fixtures-sync] Found ${activeSeasons.length} active seasons`
    );

    // 2. Fetch fixtures per league + season
    for (const { season, league } of activeSeasons) {
      const competitionCode = getCompetitionCode(league.name);

      if (!competitionCode) {
        console.warn(
          `[fixtures-sync] No competition code for league "${league.name}", skipping`
        );
        continue;
      }

      console.log(
        `[fixtures-sync] Fetching fixtures for ${league.name} (${competitionCode}) season ${season.year}`
      );

      const response = await footballDataClient.getMatchesByCompetition(
        competitionCode,
        season.year
      );

      if (!response || !response.matches) {
        console.warn(
          `[fixtures-sync] No matches returned for ${competitionCode}`
        );
        continue;
      }

      console.log(
        `[fixtures-sync] Received ${response.matches.length} fixtures`
      );

      for (const match of response.matches) {
        try {
          context.recordsProcessed++;

          const fixtureId = match.id;

          const existing = await db
            .select()
            .from(fixtures)
            .where(eq(fixtures.id, fixtureId))
            .limit(1);

          const fixtureRecord = {
            id: fixtureId,
            externalId: fixtureId,
            date: new Date(match.utcDate),
            timestamp: Math.floor(new Date(match.utcDate).getTime() / 1000),
            venueId: null, // football-data.org does not expose venue IDs consistently
            statusLong: match.status,
            statusShort: match.status,
            leagueId: league.id,
            seasonId: season.id,
            homeTeamId: match.homeTeam.id,
            awayTeamId: match.awayTeam.id,
            goalsHome: match.score.fullTime.home,
            goalsAway: match.score.fullTime.away,
            createdAt: new Date(),
          };

          if (existing.length > 0) {
            await db
              .update(fixtures)
              .set(fixtureRecord)
              .where(eq(fixtures.id, fixtureId));

            context.recordsUpdated++;
          } else {
            await db.insert(fixtures).values(fixtureRecord);
            context.recordsInserted++;
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          context.errors.push(`Fixture ${match.id}: ${msg}`);
          console.error(
            `[fixtures-sync] Error processing fixture ${match.id}`,
            err
          );
        }
      }
    }

    const log = syncLogger.endSync(context, "football-data.org");
    return { success: true, log };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    context.errors.push(`Fatal error: ${msg}`);
    console.error("[fixtures-sync] Fatal error:", error);

    const log = syncLogger.endSync(context, "football-data.org");
    return { success: false, log, error: msg };
  }
}
