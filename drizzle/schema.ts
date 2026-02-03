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
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* =========================
   ENUMS
========================= */

export const userRole = ["user", "admin"] as const;
export const leagueType = ["League", "Cup"] as const;
export const trophyEntity = ["player", "coach"] as const;
export const ingestionStatus = ["success", "failure", "partial"] as const;

/* =========================
   USERS
========================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: varchar("role", { length: 16 }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
}, (t) => ({
  openIdUnique: uniqueIndex("users_open_id_unique").on(t.openId),
}));

/* =========================
   COUNTRIES
========================= */

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 3 }),
  flag: text("flag"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================
   VENUES
========================= */

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

/* =========================
   LEAGUES
========================= */

export const leagues = pgTable("leagues", {
  id: serial("id").primaryKey(),
  apiFootballId: integer("api_football_id"),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 16 }).notNull(),
  logo: text("logo"),
  countryId: integer("country_id").references(() => countries.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================
   SEASONS
========================= */

export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").notNull().references(() => leagues.id),
  year: integer("year").notNull(),
  start: timestamp("start").notNull(),
  end: timestamp("end").notNull(),
  current: boolean("current").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================
   TEAMS
========================= */

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

/* =========================
   FIXTURES
========================= */

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

/* =========================
   TROPHIES
========================= */

export const trophies = pgTable("trophies", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 16 }).notNull(), // player | coach
  entityId: integer("entity_id").notNull(),
  league: varchar("league", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  season: varchar("season", { length: 50 }).notNull(),
  place: varchar("place", { length: 50 }).notNull(), // Winner, Runner-up, etc
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =========================
   FIXTURE DETAILS
========================= */

export const fixtureEvents = pgTable("fixture_events", {
  id: serial("id").primaryKey(),
  fixtureId: integer("fixture_id").notNull().references(() => fixtures.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  playerId: integer("player_id").references(() => players.id),
  timeElapsed: integer("time_elapsed").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  detail: varchar("detail", { length: 100 }),
});

export const fixtureLineups = pgTable("fixture_lineups", {
  id: serial("id").primaryKey(),
  fixtureId: integer("fixture_id").notNull().references(() => fixtures.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  formation: varchar("formation", { length: 20 }),
  startXI: jsonb("start_xi").notNull(),
  substitutes: jsonb("substitutes").notNull(),
});

export const fixtureStatistics = pgTable("fixture_statistics", {
  id: serial("id").primaryKey(),
  fixtureId: integer("fixture_id").notNull().references(() => fixtures.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  statistics: jsonb("statistics").notNull(),
});

/* =========================
   PLAYERS
========================= */

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
  statistics: jsonb("statistics").notNull(),
});

/* =========================
   COACHES / TRANSFERS / INJURIES
========================= */

export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  teamId: integer("team_id").references(() => teams.id),
});

export const transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  teamInId: integer("team_in_id").references(() => teams.id),
  teamOutId: integer("team_out_id").references(() => teams.id),
  date: timestamp("date").notNull(),
});

export const injuries = pgTable("injuries", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  fixtureId: integer("fixture_id").references(() => fixtures.id),
  date: timestamp("date").notNull(),
});

/* =========================
   STANDINGS / ODDS / PREDICTIONS
========================= */

export const standings = pgTable("standings", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").notNull().references(() => leagues.id),
  seasonId: integer("season_id").notNull().references(() => seasons.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  rank: integer("rank").notNull(),
  points: integer("points").notNull(),
});

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

/* =========================
   ELO / META
========================= */

export const eloRatings = pgTable("elo_ratings", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  seasonId: integer("season_id").notNull().references(() => seasons.id),
  rating: numeric("rating", { precision: 7, scale: 2 }).notNull(),
});

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
});
