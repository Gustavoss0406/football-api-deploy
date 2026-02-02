/**
 * Players Sync Worker
 * 
 * Synchronizes player data and statistics from football-data.org to D1 database.
 * Runs every 6 hours to keep player information up-to-date.
 */

import { footballDataClient } from "../ingestion/sources/football-data-org";
import { syncLogger } from "../ingestion/utils/sync-logger";
import { getDb } from "../db";
import { players, playerStatistics, teams, seasons } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function syncPlayers() {
  const context = syncLogger.startSync("players-sync");
  
  try {
    console.log("[players-sync] Starting players synchronization...");
    
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    
    // Get active seasons to sync players for
    const activeSeasons = await db
      .select()
      .from(seasons)
      .where(eq(seasons.current, true))
      .limit(5); // Limit to avoid rate limiting
    
    console.log(`[players-sync] Found ${activeSeasons.length} active seasons`);
    
    // Process each active season
    for (const season of activeSeasons) {
      try {
        context.recordsProcessed++;
        
        // Get teams for this league/season
        const teamsInSeason = await db
          .select()
          .from(teams)
          .limit(10); // Limit to avoid rate limiting (10 teams per run)
        
        console.log(`[players-sync] Processing ${teamsInSeason.length} teams for season ${season.year}`);
        
        // Process each team
        for (const team of teamsInSeason) {
          try {
            console.log(`[players-sync] Fetching players for team ${team.id}, season ${season.year}`);
            
            // Fetch players from football-data.org
            const response = await footballDataClient.getPlayers({
              team: team.id,
              season: season.year,
            });
            
            if (!response || !response.response || response.response.length === 0) {
              console.warn(`[players-sync] No players found for team ${team.id}, season ${season.year}`);
              continue;
            }
            
            const playersData = response.response;
            console.log(`[players-sync] Received ${playersData.length} players for team ${team.id}`);
            
            // Process each player
            for (const playerData of playersData) {
              try {
                const player = playerData.player;
                const statistics = playerData.statistics;
                
                // Check if player exists
                const existingPlayer = await db
                  .select()
                  .from(players)
                  .where(eq(players.id, player.id))
                  .limit(1);
                
                const playerRecord = {
                  id: player.id,
                  name: player.name,
                  firstname: player.firstname,
                  lastname: player.lastname,
                  age: player.age,
                  birthDate: player.birth?.date ? new Date(player.birth.date) : null,
                  birthPlace: player.birth?.place || null,
                  birthCountry: player.birth?.country || null,
                  nationality: player.nationality,
                  height: player.height,
                  weight: player.weight,
                  injured: player.injured || false,
                  photo: player.photo,
                };
                
                if (existingPlayer.length > 0) {
                  // Update existing player
                  await db
                    .update(players)
                    .set({
                      ...playerRecord,
                      updatedAt: new Date(),
                    })
                    .where(eq(players.id, player.id));
                  
                  context.recordsUpdated++;
                } else {
                  // Insert new player
                  await db.insert(players).values(playerRecord);
                  context.recordsInserted++;
                }
                
                // Sync player statistics if available
                if (statistics && statistics.length > 0) {
                  for (const stat of statistics) {
                    try {
                      // Check if statistics exist
                      const existingStats = await db
                        .select()
                        .from(playerStatistics)
                        .where(
                          and(
                            eq(playerStatistics.playerId, player.id),
                            eq(playerStatistics.teamId, stat.team.id),
                            eq(playerStatistics.leagueId, stat.league.id),
                            eq(playerStatistics.seasonId, season.id)
                          )
                        )
                        .limit(1);
                      
                      const statsRecord = {
                        playerId: player.id,
                        teamId: stat.team.id,
                        leagueId: stat.league.id,
                        seasonId: season.id,
                        season: season.year,
                        position: stat.games?.position || null,
                        rating: stat.games?.rating || null,
                        captain: stat.games?.captain || false,
                        statistics: JSON.stringify(stat),
                      };
                      
                      if (existingStats.length > 0) {
                        // Update existing statistics
                        await db
                          .update(playerStatistics)
                          .set({
                            ...statsRecord,
                            updatedAt: new Date(),
                          })
                          .where(eq(playerStatistics.id, existingStats[0].id));
                      } else {
                        // Insert new statistics
                        await db.insert(playerStatistics).values(statsRecord);
                      }
                    } catch (error) {
                      const errorMsg = error instanceof Error ? error.message : String(error);
                      context.errors.push(`Player stats ${player.id}: ${errorMsg}`);
                      console.error(`[players-sync] Error processing player statistics ${player.id}:`, error);
                    }
                  }
                }
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                context.errors.push(`Player ${playerData.player.id}: ${errorMsg}`);
                console.error(`[players-sync] Error processing player ${playerData.player.id}:`, error);
              }
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            context.errors.push(`Team ${team.id}: ${errorMsg}`);
            console.error(`[players-sync] Error processing team ${team.id}:`, error);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        context.errors.push(`Season ${season.id}: ${errorMsg}`);
        console.error(`[players-sync] Error processing season ${season.id}:`, error);
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
    console.error("[players-sync] Fatal error:", error);
    
    const log = syncLogger.endSync(context, "football-data.org");
    
    return {
      success: false,
      log,
      error: errorMsg,
    };
  }
}
