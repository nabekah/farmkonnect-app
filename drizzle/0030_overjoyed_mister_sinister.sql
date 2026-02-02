CREATE TABLE `reportExecutionDetails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`executionLogId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`recipientName` varchar(255),
	`deliveryStatus` enum('pending','sent','failed','bounced') NOT NULL,
	`deliveryTimestamp` timestamp,
	`errorReason` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reportExecutionDetails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reportExecutionLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleId` int NOT NULL,
	`farmId` int NOT NULL,
	`executionStatus` enum('pending','running','success','failed','partial') NOT NULL,
	`executedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`reportHistoryId` int,
	`recipientCount` int NOT NULL DEFAULT 0,
	`successCount` int NOT NULL DEFAULT 0,
	`failureCount` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`executionDurationMs` int,
	`nextScheduledExecution` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reportExecutionLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reportTemplateCustomization` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`farmId` int NOT NULL,
	`brandingColor` varchar(7),
	`headerText` text,
	`footerText` text,
	`logoUrl` text,
	`includeCharts` boolean NOT NULL DEFAULT true,
	`includeMetrics` boolean NOT NULL DEFAULT true,
	`includeRecommendations` boolean NOT NULL DEFAULT true,
	`pageOrientation` enum('portrait','landscape') NOT NULL DEFAULT 'portrait',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reportTemplateCustomization_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reportTemplateSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`sectionName` varchar(100) NOT NULL,
	`sectionType` enum('financial','livestock','crop','weather','summary','custom') NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`displayOrder` int NOT NULL,
	`customContent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reportTemplateSections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `reportExecutionDetails` ADD CONSTRAINT `reportExecutionDetails_executionLogId_reportExecutionLog_id_fk` FOREIGN KEY (`executionLogId`) REFERENCES `reportExecutionLog`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportExecutionLog` ADD CONSTRAINT `reportExecutionLog_scheduleId_reportSchedules_id_fk` FOREIGN KEY (`scheduleId`) REFERENCES `reportSchedules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportExecutionLog` ADD CONSTRAINT `reportExecutionLog_farmId_farms_id_fk` FOREIGN KEY (`farmId`) REFERENCES `farms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportExecutionLog` ADD CONSTRAINT `reportExecutionLog_reportHistoryId_reportHistory_id_fk` FOREIGN KEY (`reportHistoryId`) REFERENCES `reportHistory`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportTemplateCustomization` ADD CONSTRAINT `reportTemplateCustomization_templateId_reportTemplates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `reportTemplates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportTemplateCustomization` ADD CONSTRAINT `reportTemplateCustomization_farmId_farms_id_fk` FOREIGN KEY (`farmId`) REFERENCES `farms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportTemplateSections` ADD CONSTRAINT `reportTemplateSections_templateId_reportTemplates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `reportTemplates`(`id`) ON DELETE no action ON UPDATE no action;