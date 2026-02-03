import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const fixturesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { limit, offset } = input;

      const { rows } = await pool.query(
        `
        SELECT
          id,
          league_id,
          home_team_id,
          away_team_id,
          kickoff_at,
          status
        FROM fixtures
        ORDER BY kickoff_at DESC
        LIMIT $1 OFFSET $2
        `,
        [limit, offset]
      );

      return {
        ok: true,
        count: rows.length,
        fixtures: rows,
      };
    }),
});
