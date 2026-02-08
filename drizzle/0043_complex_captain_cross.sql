CREATE TABLE `savedQueries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`query` varchar(255) NOT NULL,
	`filters` text,
	`category` varchar(50),
	`icon` varchar(50),
	`isPinned` boolean NOT NULL DEFAULT false,
	`usageCount` int NOT NULL DEFAULT 0,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedQueries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `searchFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`searchId` int,
	`query` varchar(255) NOT NULL,
	`resultId` int,
	`resultType` varchar(50) NOT NULL,
	`resultTitle` varchar(255),
	`rating` int,
	`helpful` boolean,
	`relevanceScore` decimal(5,2),
	`clickedAt` timestamp,
	`feedbackType` varchar(50),
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `searchFeedback_id` PRIMARY KEY(`id`)
);
