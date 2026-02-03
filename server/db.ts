import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * Drizzle instance
 */
export const db = drizzle(pool);

/**
 * Legacy compatibility
 * ----------------------------------
 * These exports exist so older parts
 * of the codebase keep working.
 * We will refactor them later.
 */

export function getDb() {
  return db;
}

// TEMP stubs to satisfy imports
// (they should not be called in prod paths yet)

export async function getUserByOpenId(_openId: string) {
  return null;
}

export async function upsertUser(_user: unknown) {
  return;
}
