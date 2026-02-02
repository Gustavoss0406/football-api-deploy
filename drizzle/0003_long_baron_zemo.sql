ALTER TABLE `leagues` ADD `apiFootballId` int;--> statement-breakpoint
ALTER TABLE `leagues` ADD CONSTRAINT `leagues_apiFootballId_unique` UNIQUE(`apiFootballId`);