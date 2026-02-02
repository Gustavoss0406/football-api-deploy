/**
 * Fixtures Sync Worker
 * 
 * Synchronizes fixtures from football-data.org to D1 database.
 * Runs every 15 minutes to keep fixtures up-to-date.
 */

import { footballDataClient } from "../ingestion/sources/football-data-org";
import { syncLogger } from "../ingestion/utils/sync-logger";
import { getDb } from "../db";
import { fixtures, leagues, seasons, teams, venues } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function syncFixtures() {
  const context = syncLogger.startSync("fixtures-sync");
  
  try {
    console.log("[fixtures-sync] Starting fixtures synchronization...");
    
    // Get fixtures for next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const fromDate = today.toISOString().split("T")[0];
    const toDate = nextWeek.toISOString().split("T")[0];
    
    console.log(`[fixtures-sync] Fetching fixtures from ${fromDate} to ${toDate}`);
    
    // Fetch from football-data.org
    const response = await footballDataClient.getFixtures({
      from: fromDate,
      to: toDate,
    });
    
    if (!response || !response.response) {
      throw new Error("Invalid response from football-data.org");
    }
    
    const fixturesData = response.response;
    console.log(`[fixtures-sync] Received ${fixturesData.length} fixtures`);
    
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    
    // Process each fixture
    for (const fixtureData of fixturesData) {
      try {
        context.recordsProcessed++;
        
        // Check if fixture exists
        const existingFixture = await db
          .select()
          .from(fixtures)
          .where(eq(fixtures.id, fixtureData.fixture.id))
          .limit(1);
        
        const fixtureRecord = {
          id: fixtureData.fixture.id,
          referee: fixtureData.fixture.referee,
          timezone: fixtureData.fixture.timezone,
          date: new Date(fixtureData.fixture.date),
          timestamp: fixtureData.fixture.timestamp,
          periodsFirst: fixtureData.fixture.periods?.first || null,
          periodsSecond: fixtureData.fixture.periods?.second || null,
          venueId: fixtureData.fixture.venue?.id || null,
          statusLong: fixtureData.fixture.status.long,
          statusShort: fixtureData.fixture.status.short,
          statusElapsed: fixtureData.fixture.status.elapsed,
          leagueId: fixtureData.league.id,
          seasonId: fixtureData.league.season,
          round: fixtureData.league.round,
          homeTeamId: fixtureData.teams.home.id,
          awayTeamId: fixtureData.teams.away.id,
          goalsHome: fixtureData.goals.home,
          goalsAway: fixtureData.goals.away,
          scoreHalftimeHome: fixtureData.score.halftime?.home || null,
          scoreHalftimeAway: fixtureData.score.halftime?.away || null,
          scoreFulltimeHome: fixtureData.score.fulltime?.home || null,
          scoreFulltimeAway: fixtureData.score.fulltime?.away || null,
          scoreExtratimeHome: fixtureData.score.extratime?.home || null,
          scoreExtratimeAway: fixtureData.score.extratime?.away || null,
          scorePenaltyHome: fixtureData.score.penalty?.home || null,
          scorePenaltyAway: fixtureData.score.penalty?.away || null,
          homeWinner: fixtureData.teams.home.winner,
          awayWinner: fixtureData.teams.away.winner,
        };
        
        if (existingFixture.length > 0) {
          // Update existing fixture
          await db
            .update(fixtures)
            .set({
              ...fixtureRecord,
              updatedAt: new Date(),
            })
            .where(eq(fixtures.id, fixtureData.fixture.id));
          
          context.recordsUpdated++;
        } else {
          // Insert new fixture
          await db.insert(fixtures).values(fixtureRecord);
          context.recordsInserted++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        context.errors.push(`Fixture ${fixtureData.fixture.id}: ${errorMsg}`);
        console.error(`[fixtures-sync] Error processing fixture ${fixtureData.fixture.id}:`, error);
      }
    }
    
    const log = syncLogger.endSync(context, "football-data.org");
    
    return {
      success: true,
      log,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    context.errors.push(`Fatal error: ${errorMsg}`);
    console.error("[fixtures-sync] Fatal error:", error);
    
    const log = syncLogger.endSync(context, "football-data.org");
    
    return {
      success: false,
      log,
      error: errorMsg,
    };
  }
}
