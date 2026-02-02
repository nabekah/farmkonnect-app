CREATE TABLE `reportHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleId` int NOT NULL,
	`farmId` int NOT NULL,
	`reportType` enum('financial','livestock','complete') NOT NULL,
	`status` enum('pending','generating','success','failed') NOT NULL DEFAULT 'pending',
	`generatedAt` timestamp,
	`sentAt` timestamp,
	`recipientCount` int DEFAULT 0,
	`fileSize` int,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reportHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reportSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`reportType` enum('financial','livestock','complete') NOT NULL,
	`frequency` enum('daily','weekly','monthly') NOT NULL,
	`recipients` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`nextRun` timestamp,
	`lastRun` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reportSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `reportHistory` ADD CONSTRAINT `reportHistory_scheduleId_reportSchedules_id_fk` FOREIGN KEY (`scheduleId`) REFERENCES `reportSchedules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportHistory` ADD CONSTRAINT `reportHistory_farmId_farms_id_fk` FOREIGN KEY (`farmId`) REFERENCES `farms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportSchedules` ADD CONSTRAINT `reportSchedules_farmId_farms_id_fk` FOREIGN KEY (`farmId`) REFERENCES `farms`(`id`) ON DELETE no action ON UPDATE no action;