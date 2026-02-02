/**
 * Details Sync Worker
 * 
 * Synchronizes fixture details (events, lineups, statistics) from football-data.org to D1 database.
 * Runs every 30 minutes to keep match details up-to-date.
 */

import { footballDataClient } from "../ingestion/sources/football-data-org";
import { syncLogger } from "../ingestion/utils/sync-logger";
import { getDb } from "../db";
import { fixtures, fixtureEvents, fixtureLineups, fixtureStatistics, teams, players } from "../../drizzle/schema";
import { eq, and, or, inArray } from "drizzle-orm";

export async function syncFixtureDetails() {
  const context = syncLogger.startSync("details-sync");
  
  try {
    console.log("[details-sync] Starting fixture details synchronization...");
    
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    
    // Get fixtures that need details sync (recent and live fixtures)
    const recentFixtures = await db
      .select()
      .from(fixtures)
      .where(
        or(
          inArray(fixtures.statusShort, ["NS", "1H", "HT", "2H", "ET", "P", "FT", "AET", "PEN"]),
          eq(fixtures.statusShort, "LIVE")
        )
      )
      .limit(20); // Limit to avoid rate limiting
    
    console.log(`[details-sync] Found ${recentFixtures.length} fixtures to sync details`);
    
    // Process each fixture
    for (const fixture of recentFixtures) {
      try {
        context.recordsProcessed++;
        
        console.log(`[details-sync] Syncing details for fixture ${fixture.id}`);
        
        // Sync events
        await syncFixtureEvents(db, fixture.id, context);
        
        // Sync lineups
        await syncFixtureLineups(db, fixture.id, context);
        
        // Sync statistics
        await syncFixtureStatistics(db, fixture.id, context);
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        context.errors.push(`Fixture ${fixture.id}: ${errorMsg}`);
        console.error(`[details-sync] Error processing fixture ${fixture.id}:`, error);
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
    console.error("[details-sync] Fatal error:", error);
    
    const log = syncLogger.endSync(context, "football-data.org");
    
    return {
      success: false,
      log,
      error: errorMsg,
    };
  }
}

async function syncFixtureEvents(db: any, fixtureId: number, context: any) {
  try {
    console.log(`[details-sync] Fetching events for fixture ${fixtureId}`);
    
    const response = await footballDataClient.getFixtureEvents(fixtureId);
    
    if (!response || !response.response || response.response.length === 0) {
      console.log(`[details-sync] No events found for fixture ${fixtureId}`);
      return;
    }
    
    const eventsData = response.response[0]?.events || [];
    console.log(`[details-sync] Received ${eventsData.length} events for fixture ${fixtureId}`);
    
    // Delete existing events for this fixture
    await db.delete(fixtureEvents).where(eq(fixtureEvents.fixtureId, fixtureId));
    
    // Insert new events
    for (const event of eventsData) {
      try {
        const eventRecord = {
          fixtureId,
          teamId: event.team?.id || null,
          playerId: event.player?.id || null,
          assistPlayerId: event.assist?.id || null,
          timeElapsed: event.time?.elapsed || null,
          timeExtra: event.time?.extra || null,
          type: event.type,
          detail: event.detail,
          comments: event.comments || null,
        };
        
        await db.insert(fixtureEvents).values(eventRecord);
        context.recordsInserted++;
      } catch (error) {
        console.error(`[details-sync] Error inserting event:`, error);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[details-sync] Error syncing events for fixture ${fixtureId}:`, error);
    throw error;
  }
}

async function syncFixtureLineups(db: any, fixtureId: number, context: any) {
  try {
    console.log(`[details-sync] Fetching lineups for fixture ${fixtureId}`);
    
    const response = await footballDataClient.getFixtureLineups(fixtureId);
    
    if (!response || !response.response || response.response.length === 0) {
      console.log(`[details-sync] No lineups found for fixture ${fixtureId}`);
      return;
    }
    
    const lineupsData = response.response;
    console.log(`[details-sync] Received ${lineupsData.length} lineups for fixture ${fixtureId}`);
    
    // Delete existing lineups for this fixture
    await db.delete(fixtureLineups).where(eq(fixtureLineups.fixtureId, fixtureId));
    
    // Insert new lineups
    for (const lineup of lineupsData) {
      try {
        const lineupRecord = {
          fixtureId,
          teamId: lineup.team?.id || null,
          formation: lineup.formation,
          startXI: JSON.stringify(lineup.startXI || []),
          substitutes: JSON.stringify(lineup.substitutes || []),
          coach: JSON.stringify(lineup.coach || null),
        };
        
        await db.insert(fixtureLineups).values(lineupRecord);
        context.recordsInserted++;
      } catch (error) {
        console.error(`[details-sync] Error inserting lineup:`, error);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[details-sync] Error syncing lineups for fixture ${fixtureId}:`, error);
    throw error;
  }
}

async function syncFixtureStatistics(db: any, fixtureId: number, context: any) {
  try {
    console.log(`[details-sync] Fetching statistics for fixture ${fixtureId}`);
    
    const response = await footballDataClient.getFixtureStatistics(fixtureId);
    
    if (!response || !response.response || response.response.length === 0) {
      console.log(`[details-sync] No statistics found for fixture ${fixtureId}`);
      return;
    }
    
    const statisticsData = response.response;
    console.log(`[details-sync] Received ${statisticsData.length} statistics for fixture ${fixtureId}`);
    
    // Delete existing statistics for this fixture
    await db.delete(fixtureStatistics).where(eq(fixtureStatistics.fixtureId, fixtureId));
    
    // Insert new statistics
    for (const stats of statisticsData) {
      try {
        const statsRecord = {
          fixtureId,
          teamId: stats.team?.id || null,
          statistics: JSON.stringify(stats.statistics || []),
        };
        
        await db.insert(fixtureStatistics).values(statsRecord);
        context.recordsInserted++;
      } catch (error) {
        console.error(`[details-sync] Error inserting statistics:`, error);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[details-sync] Error syncing statistics for fixture ${fixtureId}:`, error);
    throw error;
  }
}
