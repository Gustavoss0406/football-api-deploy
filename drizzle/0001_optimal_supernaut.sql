CREATE TABLE `coaches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` int,
	`name` varchar(255) NOT NULL,
	`firstname` varchar(255),
	`lastname` varchar(255),
	`age` int,
	`birthDate` timestamp,
	`birthPlace` varchar(255),
	`birthCountry` varchar(255),
	`nationality` varchar(100),
	`height` varchar(20),
	`weight` varchar(20),
	`photo` text,
	`teamId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coaches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(3),
	`flag` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `countries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_ingestion_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(100) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`status` enum('success','failure','partial') NOT NULL,
	`recordsProcessed` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `data_ingestion_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fixture_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fixtureId` int NOT NULL,
	`timeElapsed` int NOT NULL,
	`timeExtra` int,
	`teamId` int NOT NULL,
	`playerId` int,
	`assistPlayerId` int,
	`type` varchar(50) NOT NULL,
	`detail` varchar(100),
	`comments` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fixture_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fixture_lineups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fixtureId` int NOT NULL,
	`teamId` int NOT NULL,
	`formation` varchar(20),
	`startXI` json NOT NULL,
	`substitutes` json NOT NULL,
	`coach` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fixture_lineups_id` PRIMARY KEY(`id`),
	CONSTRAINT `fixture_lineups_fixture_team_unique` UNIQUE(`fixtureId`,`teamId`)
);
--> statement-breakpoint
CREATE TABLE `fixture_player_statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fixtureId` int NOT NULL,
	`teamId` int NOT NULL,
	`playerId` int NOT NULL,
	`statistics` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fixture_player_statistics_id` PRIMARY KEY(`id`),
	CONSTRAINT `fixture_player_statistics_fixture_player_unique` UNIQUE(`fixtureId`,`playerId`)
);
--> statement-breakpoint
CREATE TABLE `fixture_statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fixtureId` int NOT NULL,
	`teamId` int NOT NULL,
	`statistics` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fixture_statistics_id` PRIMARY KEY(`id`),
	CONSTRAINT `fixture_statistics_fixture_team_unique` UNIQUE(`fixtureId`,`teamId`)
);
--> statement-breakpoint
CREATE TABLE `fixtures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` int,
	`referee` varchar(255),
	`timezone` varchar(100) NOT NULL DEFAULT 'UTC',
	`date` timestamp NOT NULL,
	`timestamp` int NOT NULL,
	`periodsFirst` int,
	`periodsSecond` int,
	`venueId` int,
	`statusLong` varchar(100) NOT NULL,
	`statusShort` varchar(10) NOT NULL,
	`statusElapsed` int,
	`leagueId` int NOT NULL,
	`seasonId` int NOT NULL,
	`round` varchar(255),
	`homeTeamId` int NOT NULL,
	`awayTeamId` int NOT NULL,
	`goalsHome` int,
	`goalsAway` int,
	`scoreHalftimeHome` int,
	`scoreHalftimeAway` int,
	`scoreFulltimeHome` int,
	`scoreFulltimeAway` int,
	`scoreExtratimeHome` int,
	`scoreExtratimeAway` int,
	`scorePenaltyHome` int,
	`scorePenaltyAway` int,
	`homeWinner` boolean,
	`awayWinner` boolean,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fixtures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `injuries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`teamId` int NOT NULL,
	`leagueId` int NOT NULL,
	`seasonId` int NOT NULL,
	`fixtureId` int,
	`type` varchar(100) NOT NULL,
	`reason` text,
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `injuries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leagues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('League','Cup') NOT NULL,
	`logo` text,
	`countryId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leagues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `odds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fixtureId` int NOT NULL,
	`bookmaker` varchar(100),
	`bet` varchar(100) NOT NULL,
	`values` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `odds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `player_statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`teamId` int NOT NULL,
	`leagueId` int NOT NULL,
	`seasonId` int NOT NULL,
	`position` varchar(50),
	`rating` decimal(4,2),
	`captain` boolean NOT NULL DEFAULT false,
	`appearences` int NOT NULL DEFAULT 0,
	`lineups` int NOT NULL DEFAULT 0,
	`minutes` int NOT NULL DEFAULT 0,
	`substitutesIn` int NOT NULL DEFAULT 0,
	`substitutesOut` int NOT NULL DEFAULT 0,
	`substitutesBench` int NOT NULL DEFAULT 0,
	`shotsTotal` int NOT NULL DEFAULT 0,
	`shotsOn` int NOT NULL DEFAULT 0,
	`goalsTotal` int NOT NULL DEFAULT 0,
	`goalsConceded` int NOT NULL DEFAULT 0,
	`goalsAssists` int NOT NULL DEFAULT 0,
	`goalsSaves` int NOT NULL DEFAULT 0,
	`passesTotal` int NOT NULL DEFAULT 0,
	`passesKey` int NOT NULL DEFAULT 0,
	`passesAccuracy` int NOT NULL DEFAULT 0,
	`tacklesTotal` int NOT NULL DEFAULT 0,
	`tacklesBlocks` int NOT NULL DEFAULT 0,
	`tacklesInterceptions` int NOT NULL DEFAULT 0,
	`duelsTotal` int NOT NULL DEFAULT 0,
	`duelsWon` int NOT NULL DEFAULT 0,
	`dribblesAttempts` int NOT NULL DEFAULT 0,
	`dribblesSuccess` int NOT NULL DEFAULT 0,
	`dribblesPast` int NOT NULL DEFAULT 0,
	`foulsDrawn` int NOT NULL DEFAULT 0,
	`foulsCommitted` int NOT NULL DEFAULT 0,
	`cardsYellow` int NOT NULL DEFAULT 0,
	`cardsYellowred` int NOT NULL DEFAULT 0,
	`cardsRed` int NOT NULL DEFAULT 0,
	`penaltyWon` int NOT NULL DEFAULT 0,
	`penaltyCommitted` int NOT NULL DEFAULT 0,
	`penaltyScored` int NOT NULL DEFAULT 0,
	`penaltyMissed` int NOT NULL DEFAULT 0,
	`penaltySaved` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `player_statistics_id` PRIMARY KEY(`id`),
	CONSTRAINT `player_statistics_player_season_unique` UNIQUE(`playerId`,`teamId`,`leagueId`,`seasonId`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` int,
	`name` varchar(255) NOT NULL,
	`firstname` varchar(255),
	`lastname` varchar(255),
	`age` int,
	`birthDate` timestamp,
	`birthPlace` varchar(255),
	`birthCountry` varchar(255),
	`nationality` varchar(100),
	`height` varchar(20),
	`weight` varchar(20),
	`photo` text,
	`injured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fixtureId` int NOT NULL,
	`winnerName` varchar(255),
	`winnerComment` text,
	`winOrDraw` boolean,
	`underOver` varchar(50),
	`goalsHome` decimal(4,2),
	`goalsAway` decimal(4,2),
	`advice` text,
	`percentHome` decimal(5,2),
	`percentDraw` decimal(5,2),
	`percentAway` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`),
	CONSTRAINT `predictions_fixture_unique` UNIQUE(`fixtureId`)
);
--> statement-breakpoint
CREATE TABLE `seasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leagueId` int NOT NULL,
	`year` int NOT NULL,
	`start` timestamp NOT NULL,
	`end` timestamp NOT NULL,
	`current` boolean NOT NULL DEFAULT false,
	`coverageFixturesEvents` boolean NOT NULL DEFAULT false,
	`coverageFixturesLineups` boolean NOT NULL DEFAULT false,
	`coverageFixturesStatistics` boolean NOT NULL DEFAULT false,
	`coverageFixturesPlayers` boolean NOT NULL DEFAULT false,
	`coverageStandings` boolean NOT NULL DEFAULT false,
	`coveragePlayers` boolean NOT NULL DEFAULT false,
	`coverageTopScorers` boolean NOT NULL DEFAULT false,
	`coverageTopAssists` boolean NOT NULL DEFAULT false,
	`coverageTopCards` boolean NOT NULL DEFAULT false,
	`coverageInjuries` boolean NOT NULL DEFAULT false,
	`coveragePredictions` boolean NOT NULL DEFAULT false,
	`coverageOdds` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seasons_id` PRIMARY KEY(`id`),
	CONSTRAINT `seasons_league_year_unique` UNIQUE(`leagueId`,`year`)
);
--> statement-breakpoint
CREATE TABLE `standings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leagueId` int NOT NULL,
	`seasonId` int NOT NULL,
	`teamId` int NOT NULL,
	`rank` int NOT NULL,
	`points` int NOT NULL,
	`goalsDiff` int NOT NULL,
	`group` varchar(100),
	`form` varchar(20),
	`status` varchar(100),
	`description` text,
	`allPlayed` int NOT NULL,
	`allWin` int NOT NULL,
	`allDraw` int NOT NULL,
	`allLose` int NOT NULL,
	`allGoalsFor` int NOT NULL,
	`allGoalsAgainst` int NOT NULL,
	`homePlayed` int NOT NULL,
	`homeWin` int NOT NULL,
	`homeDraw` int NOT NULL,
	`homeLose` int NOT NULL,
	`homeGoalsFor` int NOT NULL,
	`homeGoalsAgainst` int NOT NULL,
	`awayPlayed` int NOT NULL,
	`awayWin` int NOT NULL,
	`awayDraw` int NOT NULL,
	`awayLose` int NOT NULL,
	`awayGoalsFor` int NOT NULL,
	`awayGoalsAgainst` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `standings_id` PRIMARY KEY(`id`),
	CONSTRAINT `standings_league_season_team_unique` UNIQUE(`leagueId`,`seasonId`,`teamId`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(10),
	`countryId` int,
	`founded` int,
	`national` boolean NOT NULL DEFAULT false,
	`logo` text,
	`venueId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timezones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timezone` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timezones_id` PRIMARY KEY(`id`),
	CONSTRAINT `timezones_timezone_unique` UNIQUE(`timezone`)
);
--> statement-breakpoint
CREATE TABLE `transfers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`date` timestamp NOT NULL,
	`type` varchar(50),
	`teamInId` int,
	`teamOutId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trophies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('player','coach') NOT NULL,
	`entityId` int NOT NULL,
	`league` varchar(255) NOT NULL,
	`country` varchar(255) NOT NULL,
	`season` varchar(50) NOT NULL,
	`place` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trophies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `venues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`city` varchar(255),
	`countryId` int,
	`capacity` int,
	`surface` varchar(100),
	`image` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `venues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `coaches` ADD CONSTRAINT `coaches_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixture_events` ADD CONSTRAINT `fixture_events_fixtureId_fixtures_id_fk` FOREIGN KEY (`fixtureId`) REFERENCES `fixtures`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixture_events` ADD CONSTRAINT `fixture_events_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixture_events` ADD CONSTRAINT `fixture_events_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixture_events` ADD CONSTRAINT `fixture_events_assistPlayerId_players_id_fk` FOREIGN KEY (`assistPlayerId`) REFERENCES `players`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixture_lineups` ADD CONSTRAINT `fixture_lineups_fixtureId_fixtures_id_fk` FOREIGN KEY (`fixtureId`) REFERENCES `fixtures`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixture_lineups` ADD CONSTRAINT `fixture_lineups_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixture_player_statistics` ADD CONSTRAINT `fixture_player_statistics_fixtureId_fixtures_id_fk` FOREIGN KEY (`fixtureId`) REFERENCES `fixtures`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixture_player_statistics` ADD CONSTRAINT `fixture_player_statistics_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixture_player_statistics` ADD CONSTRAINT `fixture_player_statistics_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixture_statistics` ADD CONSTRAINT `fixture_statistics_fixtureId_fixtures_id_fk` FOREIGN KEY (`fixtureId`) REFERENCES `fixtures`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixture_statistics` ADD CONSTRAINT `fixture_statistics_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixtures` ADD CONSTRAINT `fixtures_venueId_venues_id_fk` FOREIGN KEY (`venueId`) REFERENCES `venues`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixtures` ADD CONSTRAINT `fixtures_leagueId_leagues_id_fk` FOREIGN KEY (`leagueId`) REFERENCES `leagues`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixtures` ADD CONSTRAINT `fixtures_seasonId_seasons_id_fk` FOREIGN KEY (`seasonId`) REFERENCES `seasons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixtures` ADD CONSTRAINT `fixtures_homeTeamId_teams_id_fk` FOREIGN KEY (`homeTeamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fixtures` ADD CONSTRAINT `fixtures_awayTeamId_teams_id_fk` FOREIGN KEY (`awayTeamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `injuries` ADD CONSTRAINT `injuries_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `injuries` ADD CONSTRAINT `injuries_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `injuries` ADD CONSTRAINT `injuries_leagueId_leagues_id_fk` FOREIGN KEY (`leagueId`) REFERENCES `leagues`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `injuries` ADD CONSTRAINT `injuries_seasonId_seasons_id_fk` FOREIGN KEY (`seasonId`) REFERENCES `seasons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `injuries` ADD CONSTRAINT `injuries_fixtureId_fixtures_id_fk` FOREIGN KEY (`fixtureId`) REFERENCES `fixtures`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leagues` ADD CONSTRAINT `leagues_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `odds` ADD CONSTRAINT `odds_fixtureId_fixtures_id_fk` FOREIGN KEY (`fixtureId`) REFERENCES `fixtures`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `player_statistics` ADD CONSTRAINT `player_statistics_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `player_statistics` ADD CONSTRAINT `player_statistics_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `player_statistics` ADD CONSTRAINT `player_statistics_leagueId_leagues_id_fk` FOREIGN KEY (`leagueId`) REFERENCES `leagues`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `player_statistics` ADD CONSTRAINT `player_statistics_seasonId_seasons_id_fk` FOREIGN KEY (`seasonId`) REFERENCES `seasons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `predictions` ADD CONSTRAINT `predictions_fixtureId_fixtures_id_fk` FOREIGN KEY (`fixtureId`) REFERENCES `fixtures`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seasons` ADD CONSTRAINT `seasons_leagueId_leagues_id_fk` FOREIGN KEY (`leagueId`) REFERENCES `leagues`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `standings` ADD CONSTRAINT `standings_leagueId_leagues_id_fk` FOREIGN KEY (`leagueId`) REFERENCES `leagues`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `standings` ADD CONSTRAINT `standings_seasonId_seasons_id_fk` FOREIGN KEY (`seasonId`) REFERENCES `seasons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `standings` ADD CONSTRAINT `standings_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teams` ADD CONSTRAINT `teams_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teams` ADD CONSTRAINT `teams_venueId_venues_id_fk` FOREIGN KEY (`venueId`) REFERENCES `venues`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transfers` ADD CONSTRAINT `transfers_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transfers` ADD CONSTRAINT `transfers_teamInId_teams_id_fk` FOREIGN KEY (`teamInId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transfers` ADD CONSTRAINT `transfers_teamOutId_teams_id_fk` FOREIGN KEY (`teamOutId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `venues` ADD CONSTRAINT `venues_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `coaches_name_idx` ON `coaches` (`name`);--> statement-breakpoint
CREATE INDEX `coaches_team_idx` ON `coaches` (`teamId`);--> statement-breakpoint
CREATE INDEX `countries_name_idx` ON `countries` (`name`);--> statement-breakpoint
CREATE INDEX `countries_code_idx` ON `countries` (`code`);--> statement-breakpoint
CREATE INDEX `data_ingestion_log_source_idx` ON `data_ingestion_log` (`source`);--> statement-breakpoint
CREATE INDEX `data_ingestion_log_entity_type_idx` ON `data_ingestion_log` (`entityType`);--> statement-breakpoint
CREATE INDEX `data_ingestion_log_started_at_idx` ON `data_ingestion_log` (`startedAt`);--> statement-breakpoint
CREATE INDEX `fixture_events_fixture_idx` ON `fixture_events` (`fixtureId`);--> statement-breakpoint
CREATE INDEX `fixture_events_type_idx` ON `fixture_events` (`type`);--> statement-breakpoint
CREATE INDEX `fixtures_date_idx` ON `fixtures` (`date`);--> statement-breakpoint
CREATE INDEX `fixtures_league_season_idx` ON `fixtures` (`leagueId`,`seasonId`);--> statement-breakpoint
CREATE INDEX `fixtures_home_team_idx` ON `fixtures` (`homeTeamId`);--> statement-breakpoint
CREATE INDEX `fixtures_away_team_idx` ON `fixtures` (`awayTeamId`);--> statement-breakpoint
CREATE INDEX `fixtures_status_idx` ON `fixtures` (`statusShort`);--> statement-breakpoint
CREATE INDEX `fixtures_external_id_idx` ON `fixtures` (`externalId`);--> statement-breakpoint
CREATE INDEX `injuries_player_idx` ON `injuries` (`playerId`);--> statement-breakpoint
CREATE INDEX `injuries_team_idx` ON `injuries` (`teamId`);--> statement-breakpoint
CREATE INDEX `injuries_date_idx` ON `injuries` (`date`);--> statement-breakpoint
CREATE INDEX `leagues_name_idx` ON `leagues` (`name`);--> statement-breakpoint
CREATE INDEX `leagues_country_idx` ON `leagues` (`countryId`);--> statement-breakpoint
CREATE INDEX `odds_fixture_idx` ON `odds` (`fixtureId`);--> statement-breakpoint
CREATE INDEX `odds_bookmaker_idx` ON `odds` (`bookmaker`);--> statement-breakpoint
CREATE INDEX `players_name_idx` ON `players` (`name`);--> statement-breakpoint
CREATE INDEX `players_external_id_idx` ON `players` (`externalId`);--> statement-breakpoint
CREATE INDEX `seasons_current_idx` ON `seasons` (`current`);--> statement-breakpoint
CREATE INDEX `standings_rank_idx` ON `standings` (`rank`);--> statement-breakpoint
CREATE INDEX `teams_name_idx` ON `teams` (`name`);--> statement-breakpoint
CREATE INDEX `teams_code_idx` ON `teams` (`code`);--> statement-breakpoint
CREATE INDEX `teams_country_idx` ON `teams` (`countryId`);--> statement-breakpoint
CREATE INDEX `transfers_player_idx` ON `transfers` (`playerId`);--> statement-breakpoint
CREATE INDEX `transfers_date_idx` ON `transfers` (`date`);--> statement-breakpoint
CREATE INDEX `trophies_entity_idx` ON `trophies` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `venues_name_idx` ON `venues` (`name`);--> statement-breakpoint
CREATE INDEX `venues_city_idx` ON `venues` (`city`);