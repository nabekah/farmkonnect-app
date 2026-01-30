CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('vaccination_due','vaccination_overdue','breeding_due','breeding_overdue','health_alert','performance_alert','feed_low','task_reminder','system_alert') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedAnimalId` int,
	`relatedBreedingId` int,
	`relatedVaccinationId` int,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`isRead` boolean NOT NULL DEFAULT false,
	`actionUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
