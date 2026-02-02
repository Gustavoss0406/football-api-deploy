/**
 * Standings Sync Worker
 * 
 * Synchronizes league standings from football-data.org to D1 database.
 * Runs every 1 hour to keep standings up-to-date.
 */

import { footballDataClient } from "../ingestion/sources/football-data-org";
import { syncLogger } from "../ingestion/utils/sync-logger";
import { getDb } from "../db";
import { standings, leagues, seasons } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function syncStandings() {
  const context = syncLogger.startSync("standings-sync");
  
  try {
    console.log("[standings-sync] Starting standings synchronization...");
    
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    
    // Get active leagues (current season)
    const activeSeasons = await db
      .select()
      .from(seasons)
      .where(eq(seasons.current, true));
    
    console.log(`[standings-sync] Found ${activeSeasons.length} active seasons`);
    
    // Process each active season
    for (const season of activeSeasons) {
      try {
        context.recordsProcessed++;
        
        console.log(`[standings-sync] Fetching standings for league ${season.leagueId}, season ${season.year}`);
        
        // Fetch standings from football-data.org
        const response = await footballDataClient.getStandings(season.leagueId, season.year);
        
        if (!response || !response.response || response.response.length === 0) {
          console.warn(`[standings-sync] No standings found for league ${season.leagueId}, season ${season.year}`);
          continue;
        }
        
        const standingsData = response.response[0].league.standings;
        
        if (!standingsData || standingsData.length === 0) {
          console.warn(`[standings-sync] Empty standings for league ${season.leagueId}, season ${season.year}`);
          continue;
        }
        
        // Process each standing group (usually just one, but can be multiple for groups)
        for (const standingGroup of standingsData) {
          for (const standing of standingGroup) {
            try {
              // Check if standing exists
              const existingStanding = await db
                .select()
                .from(standings)
                .where(
                  and(
                    eq(standings.leagueId, season.leagueId),
                    eq(standings.seasonId, season.id),
                    eq(standings.teamId, standing.team.id)
                  )
                )
                .limit(1);
              
              const standingRecord = {
                leagueId: season.leagueId,
                seasonId: season.id,
                teamId: standing.team.id,
                rank: standing.rank,
                points: standing.points,
                goalsDiff: standing.goalsDiff,
                group: standing.group || null,
                form: standing.form || null,
                status: standing.status || null,
                description: standing.description || null,
                // All matches
                allPlayed: standing.all.played,
                allWin: standing.all.win,
                allDraw: standing.all.draw,
                allLose: standing.all.lose,
                allGoalsFor: standing.all.goals.for,
                allGoalsAgainst: standing.all.goals.against,
                // Home matches
                homePlayed: standing.home.played,
                homeWin: standing.home.win,
                homeDraw: standing.home.draw,
                homeLose: standing.home.lose,
                homeGoalsFor: standing.home.goals.for,
                homeGoalsAgainst: standing.home.goals.against,
                // Away matches
                awayPlayed: standing.away.played,
                awayWin: standing.away.win,
                awayDraw: standing.away.draw,
                awayLose: standing.away.lose,
                awayGoalsFor: standing.away.goals.for,
                awayGoalsAgainst: standing.away.goals.against,
              };
              
              if (existingStanding.length > 0) {
                // Update existing standing
                await db
                  .update(standings)
                  .set({
                    ...standingRecord,
                    updatedAt: new Date(),
                  })
                  .where(eq(standings.id, existingStanding[0].id));
                
                context.recordsUpdated++;
              } else {
                // Insert new standing
                await db.insert(standings).values(standingRecord);
                context.recordsInserted++;
              }
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              context.errors.push(`Standing team ${standing.team.id}: ${errorMsg}`);
              console.error(`[standings-sync] Error processing standing for team ${standing.team.id}:`, error);
            }
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        context.errors.push(`Season ${season.id}: ${errorMsg}`);
        console.error(`[standings-sync] Error processing season ${season.id}:`, error);
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
    console.error("[standings-sync] Fatal error:", error);
    
    const log = syncLogger.endSync(context, "football-data.org");
    
    return {
      success: false,
      log,
      error: errorMsg,
    };
  }
}
