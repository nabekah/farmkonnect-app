CREATE TABLE `timeTrackerLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`workerId` int NOT NULL,
	`activityType` varchar(100) NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`durationMinutes` int,
	`notes` text,
	`gpsLatitude` decimal(10,8),
	`gpsLongitude` decimal(11,8),
	`photoUrls` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeTrackerLogs_id` PRIMARY KEY(`id`)
);
