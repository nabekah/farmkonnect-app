CREATE TABLE `farmActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`activityType` enum('crop_planting','livestock_addition','weather_alert','harvest','feeding','health_check','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `farmActivities_id` PRIMARY KEY(`id`)
);
