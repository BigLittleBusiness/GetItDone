ALTER TABLE `tasks` ADD `recurrenceType` enum('daily','weekly','monthly','days_of_week','after_completion');--> statement-breakpoint
ALTER TABLE `tasks` ADD `recurrenceDays` varchar(13);--> statement-breakpoint
ALTER TABLE `tasks` ADD `parentTaskId` int;