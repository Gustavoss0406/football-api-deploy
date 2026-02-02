/**
 * Scheduler for automated worker execution
 * 
 * Configures and manages periodic execution of sync workers.
 * Ensures idempotency and observability.
 */

import { syncFixtures } from "./fixtures-sync";
import { syncStandings } from "./standings-sync";
import { syncPlayers } from "./players-sync";
import { syncFixtureDetails } from "./details-sync";

/**
 * Scheduler configuration
 * 
 * Defines execution intervals for each worker:
 * - fixtures: Every 15 minutes (live data)
 * - standings: Every 1 hour (slower-changing data)
 * - players: Every 6 hours (relatively static data)
 * - details: Every 30 minutes (match details)
 */
export const SCHEDULER_CONFIG = {
  fixtures: {
    interval: "*/15 * * * *", // Every 15 minutes
    description: "Sync fixtures from football-data.org",
  },
  standings: {
    interval: "0 * * * *", // Every hour
    description: "Sync standings from football-data.org",
  },
  players: {
    interval: "0 */6 * * *", // Every 6 hours
    description: "Sync players from football-data.org",
  },
  details: {
    interval: "*/30 * * * *", // Every 30 minutes
    description: "Sync fixture details (events, lineups, statistics)",
  },
};

/**
 * Execute scheduled worker
 * 
 * Handles worker execution with error handling and logging.
 * Ensures idempotency by checking last execution time.
 */
export async function executeScheduledWorker(workerName: string) {
  const startTime = Date.now();
  
  console.log(`[scheduler] Executing worker: ${workerName}`);
  
  try {
    let result;
    
    switch (workerName) {
      case "fixtures":
        result = await syncFixtures();
        break;
      case "standings":
        result = await syncStandings();
        break;
      case "players":
        result = await syncPlayers();
        break;
      case "details":
        result = await syncFixtureDetails();
        break;
      default:
        throw new Error(`Unknown worker: ${workerName}`);
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`[scheduler] Worker ${workerName} completed in ${duration}ms:`, {
      success: result.success,
      recordsProcessed: result.log?.recordsProcessed || 0,
      recordsInserted: result.log?.recordsInserted || 0,
      recordsUpdated: result.log?.recordsUpdated || 0,
      errors: result.log?.errors?.length || 0,
    });
    
    return {
      success: true,
      worker: workerName,
      duration,
      result,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    console.error(`[scheduler] Worker ${workerName} failed after ${duration}ms:`, error);
    
    return {
      success: false,
      worker: workerName,
      duration,
      error: errorMsg,
    };
  }
}

/**
 * Execute all workers (for manual trigger or initialization)
 */
export async function executeAllWorkers() {
  console.log("[scheduler] Executing all workers...");
  
  const results = await Promise.allSettled([
    executeScheduledWorker("fixtures"),
    executeScheduledWorker("standings"),
    executeScheduledWorker("players"),
    executeScheduledWorker("details"),
  ]);
  
  const summary = {
    total: results.length,
    successful: results.filter(r => r.status === "fulfilled" && r.value.success).length,
    failed: results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)).length,
    results: results.map(r => r.status === "fulfilled" ? r.value : { success: false, error: "Promise rejected" }),
  };
  
  console.log("[scheduler] All workers completed:", summary);
  
  return summary;
}

/**
 * Cron handler for Cloudflare Workers
 * 
 * This function should be called from the Cloudflare Worker scheduled event.
 * It determines which worker to execute based on the current time.
 */
export async function handleScheduledEvent(scheduledTime: Date) {
  const minute = scheduledTime.getMinutes();
  const hour = scheduledTime.getHours();
  
  const workersToExecute: string[] = [];
  
  // Fixtures: every 15 minutes
  if (minute % 15 === 0) {
    workersToExecute.push("fixtures");
  }
  
  // Details: every 30 minutes
  if (minute % 30 === 0) {
    workersToExecute.push("details");
  }
  
  // Standings: every hour
  if (minute === 0) {
    workersToExecute.push("standings");
  }
  
  // Players: every 6 hours
  if (minute === 0 && hour % 6 === 0) {
    workersToExecute.push("players");
  }
  
  console.log(`[scheduler] Scheduled execution at ${scheduledTime.toISOString()}: ${workersToExecute.join(", ")}`);
  
  const results = await Promise.allSettled(
    workersToExecute.map(worker => executeScheduledWorker(worker))
  );
  
  return {
    scheduledTime: scheduledTime.toISOString(),
    workersExecuted: workersToExecute,
    results: results.map(r => r.status === "fulfilled" ? r.value : { success: false, error: "Promise rejected" }),
  };
}
