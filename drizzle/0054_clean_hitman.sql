CREATE TABLE `approvalThresholds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`managerThreshold` decimal(12,2) NOT NULL,
	`directorThreshold` decimal(12,2) NOT NULL,
	`cfoThreshold` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'GHS',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approvalThresholds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenseApprovals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expenseId` int NOT NULL,
	`farmId` int NOT NULL,
	`approvalLevel` enum('manager','director','cfo','owner') NOT NULL,
	`approverUserId` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`comments` text,
	`approvedAt` timestamp,
	`rejectedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenseApprovals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `farmExpenseCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`categoryName` varchar(100) NOT NULL,
	`categoryType` enum('feed','medication','labor','equipment','utilities','transport','veterinary','fertilizer','seeds','pesticides','water','rent','insurance','maintenance','other'),
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farmExpenseCategories_id` PRIMARY KEY(`id`)
);
