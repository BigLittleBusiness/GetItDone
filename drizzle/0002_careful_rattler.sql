CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`slug` varchar(64) NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` text NOT NULL,
	`notes` text,
	`roleContext` enum('student','parent','professional','all') NOT NULL DEFAULT 'all',
	`status` enum('todo','in_progress','done','archived') NOT NULL DEFAULT 'todo',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`energyRequired` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`dueDate` varchar(10),
	`dueTime` varchar(5),
	`steps` json,
	`xpReward` int NOT NULL DEFAULT 10,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingComplete` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `activeRole` enum('student','parent','professional') DEFAULT 'professional' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `personalityMode` enum('cheeky','positive','literal') DEFAULT 'positive' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `xp` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `level` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `currentStreak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `longestStreak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastActiveDate` varchar(10);