CREATE TABLE `survey_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleValidation` varchar(64),
	`painPoint` varchar(64),
	`featureFit` varchar(64),
	`email` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `survey_responses_id` PRIMARY KEY(`id`)
);
