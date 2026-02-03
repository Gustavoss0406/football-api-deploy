import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  jsonb,
  index,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";

/* ============================================================
   ENUMS
============================================================ */

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const leagueTypeEnum = pgEnum("league_type", ["League", "Cup"]);
export const ingestionStatusEnum = pgEnum("ingestion_status", [
  "success",
  "failure",
  "partial",
]);
export const trophyEntityEnum = pgEnum("trophy_entity", ["player", "coach"]);

/* ============================================================
   USERS / AUTH
============================================================ */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

/* ============================================================
   COUNTRIES / VENUES
============================================================ */

export const countries = pgTable(
  "countries",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 3 }),
    flag: text("flag"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index("countries_name_idx").on(t.name),
    codeIdx: index("countries_code_idx").on(t.code),
  })
);

export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 255 }),
  countryId: integer("country_id").references(() => countries.id),
  capacity: integer("capacity"),
  surface: varchar("surface", { length: 100 }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ============================================================
   LEAGUES / SEASONS
============================================================ */

export const leagues = pgTable("leagues", {
  id: serial("id").primaryKey(),
  apiFootballId: integer("api_football_id").unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: leagueTypeEnum("type").notNull(),
  logo: text("logo"),
  countryId: integer("country_id").references(() => countries.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seasons = pgTable(
  "seasons",
  {
    id: serial("id").primaryKey(),
    leagueId: integer("league_id")
      .notNull()
      .references(() => leagues.id),
    year: integer("year").notNull(),
    start: timestamp("start_date").notNull(),
    end: timestamp("end_date").notNull(),
    current: boolean("current").default(false).notNull(),
    coverageFixtures: boolean("coverage_fixtures").default(false).notNull(),
    coverageStandings: boolean("coverage_standings").default(false).notNull(),
    coveragePlayers: boolean("coverage_players").default(false).notNull(),
    coverageOdds: boolean("coverage_odds").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueSeason: unique("season_unique").on(t.leagueId, t.year),
  })
);

/* ============================================================
   TEAMS
============================================================ */

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 10 }),
  countryId: integer("country_id").references(() => countries.id),
  founded: integer("founded"),
  national: boolean("national").default(false).notNull(),
  logo: text("logo"),
  venueId: integer("venue_id").references(() => venues.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ============================================================
   FIXTURES
============================================================ */

export const fixtures = pgTable("fixtures", {
  id: serial("id").primaryKey(),
  externalId: integer("external_id"),
  date: timestamp("date").notNull(),
  timestamp: integer("timestamp").notNull(),
  venueId: integer("venue_id").references(() => venues.id),
  statusLong: varchar("status_long", { length: 100 }).notNull(),
  statusShort: varchar("status_short", { length: 10 }).notNull(),
  leagueId: integer("league_id")
    .notNull()
    .references(() => leagues.id),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id),
  homeTeamId: integer("home_team_id")
    .notNull()
    .references(() => teams.id),
  awayTeamId: integer("away_team_id")
    .notNull()
    .references(() => teams.id),
  goalsHome: integer("goals_home"),
  goalsAway: integer("goals_away"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ============================================================
   PLAYERS
============================================================ */

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  externalId: integer("external_id"),
  name: varchar("name", { length: 255 }).notNull(),
  nationality: varchar("nationality", { length: 100 }),
  age: integer("age"),
  photo: text("photo"),
  injured: boolean("injured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ============================================================
   STANDINGS
============================================================ */

export const standings = pgTable(
  "standings",
  {
    id: serial("id").primaryKey(),
    leagueId: integer("league_id")
      .notNull()
      .references(() => leagues.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id),
    rank: integer("rank").notNull(),
    points: integer("points").notNull(),
    goalsDiff: integer("goals_diff").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueStanding: unique("standing_unique").on(
      t.leagueId,
      t.seasonId,
      t.teamId
    ),
  })
);

/* ============================================================
   ODDS & PREDICTIONS
============================================================ */

export const odds = pgTable("odds", {
  id: serial("id").primaryKey(),
  fixtureId: integer("fixture_id")
    .notNull()
    .references(() => fixtures.id),
  bookmaker: varchar("bookmaker", { length: 100 }),
  bet: varchar("bet", { length: 100 }).notNull(),
  values: jsonb("values").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  fixtureId: integer("fixture_id")
    .notNull()
    .references(() => fixtures.id),
  advice: text("advice"),
  percentHome: numeric("percent_home", { precision: 5, scale: 2 }),
  percentDraw: numeric("percent_draw", { precision: 5, scale: 2 }),
  percentAway: numeric("percent_away", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ============================================================
   INGESTION LOG
============================================================ */

export const dataIngestionLog = pgTable("data_ingestion_log", {
  id: serial("id").primaryKey(),
  source: varchar("source", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  status: ingestionStatusEnum("status").notNull(),
  recordsProcessed: integer("records_processed").default(0).notNull(),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
});
