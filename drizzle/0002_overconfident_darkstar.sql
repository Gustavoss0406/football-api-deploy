CREATE TABLE `elo_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`seasonId` int NOT NULL,
	`rating` decimal(7,2) NOT NULL DEFAULT '1500.00',
	`matchesPlayed` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `elo_ratings_id` PRIMARY KEY(`id`),
	CONSTRAINT `elo_ratings_team_season_unique` UNIQUE(`teamId`,`seasonId`)
);
--> statement-breakpoint
ALTER TABLE `elo_ratings` ADD CONSTRAINT `elo_ratings_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `elo_ratings` ADD CONSTRAINT `elo_ratings_seasonId_seasons_id_fk` FOREIGN KEY (`seasonId`) REFERENCES `seasons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `elo_ratings_rating_idx` ON `elo_ratings` (`rating`);