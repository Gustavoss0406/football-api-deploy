import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  numeric,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";

/* ============================================================================
   ENUMS
============================================================================ */

export const userRole = ["user", "admin"] as const;
export const leagueType = ["League", "Cup"] as const;
export const trophyEntity = ["player", "coach"] as const;
export const ingestionStatus = ["success", "failure", "partial"] as const;

/* ============================================================================
   USERS / AUTH
============================================================================ */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: varchar("role", { length: 16 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
}, (t) => ({
  openIdIdx: unique("users_open_id_unique").on(t.openId),
}));

export type User = typeof users.$inferSelect;

/* ============================================================================
   CORE ENTITIES
============================================================================ */

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 3 }),
  flag: text("flag"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  nameIdx: index("countries_name_idx").on(t.name),
  codeIdx: index("countries_code_idx").on(t.code),
}));

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

export const leagues = pgTable("leagues", {
  id: serial("id").primaryKey(),
  apiFootballId: integer("api_football_id"),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 16 }).notNull(),
  logo: text("logo"),
  countryId: integer("country_id").references(() => countries.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  apiIdx: unique("leagues_api_football_id_unique").on(t.apiFootballId),
}));

export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").notNull().references(() => leagues.id),
  year: integer("year").notNull(),
  start: timestamp("start").notNull(),
  end: timestamp("end").notNull(),
  current: boolean("current").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  leagueYearIdx: unique("seasons_league_year_unique").on(t.leagueId, t.year),
}));

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

/* ============================================================================
   FIXTURES
============================================================================ */

export const fixtures = pgTable("fixtures", {
  id: serial("id").primaryKey(),
  externalId: integer("external_id"),
  date: timestamp("date").notNull(),
  timestamp: integer("timestamp").notNull(),
  venueId: integer("venue_id").references(() => venues.id),
  statusLong: varchar("status_long", { length: 100 }).notNull(),
  statusShort: varchar("status_short", { length: 10 }).notNull(),
  leagueId: integer("league_id").notNull().references(() => leagues.id),
  seasonId: integer("season_id").notNull().references(() => seasons.id),
  homeTeamId: integer("home_team_id").notNull().references(() => teams.id),
  awayTeamId: integer("away_team_id").notNull().references(() => teams.id),
  goalsHome: integer("goals_home"),
  goalsAway: integer("goals_away"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ============================================================================
   PLAYERS & STATS
============================================================================ */

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

export const playerStatistics = pgTable("player_statistics", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  leagueId: integer("league_id").notNull().references(() => leagues.id),
  seasonId: integer("season_id").notNull().references(() => seasons.id),
  rating: numeric("rating", { precision: 4, scale: 2 }),
});

/* ============================================================================
   COACHES, TRANSFERS, INJURIES
============================================================================ */

export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  teamId: integer("team_id").references(() => teams.id),
});

export const transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  date: timestamp("date").notNull(),
  teamInId: integer("team_in_id").references(() => teams.id),
  teamOutId: integer("team_out_id").references(() => teams.id),
});

export const injuries = pgTable("injuries", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  fixtureId: integer("fixture_id").references(() => fixtures.id),
  date: timestamp("date").notNull(),
});

/* ============================================================================
   ODDS, PREDICTIONS, ELO
============================================================================ */

export const odds = pgTable("odds", {
  id: serial("id").primaryKey(),
  fixtureId: integer("fixture_id").notNull().references(() => fixtures.id),
  bookmaker: varchar("bookmaker", { length: 100 }),
  bet: varchar("bet", { length: 100 }).notNull(),
  values: jsonb("values").notNull(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  fixtureId: integer("fixture_id").notNull().references(() => fixtures.id),
  advice: text("advice"),
});

export const eloRatings = pgTable("elo_ratings", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  seasonId: integer("season_id").notNull().references(() => seasons.id),
  rating: numeric("rating", { precision: 7, scale: 2 }).notNull(),
});

/* ============================================================================
   MISC
============================================================================ */

export const timezones = pgTable("timezones", {
  id: serial("id").primaryKey(),
  timezone: varchar("timezone", { length: 100 }).notNull(),
});

export const dataIngestionLog = pgTable("data_ingestion_log", {
  id: serial("id").primaryKey(),
  source: varchar("source", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
});
