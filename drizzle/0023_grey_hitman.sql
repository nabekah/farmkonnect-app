CREATE TABLE `farmAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`assetType` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`purchaseDate` date NOT NULL,
	`purchaseValue` decimal(10,2),
	`currentValue` decimal(10,2),
	`maintenanceSchedule` varchar(50),
	`lastMaintenanceDate` date,
	`nextMaintenanceDate` date,
	`status` varchar(20) DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farmAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `farmExpenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`expenseDate` date NOT NULL,
	`description` text,
	`vendor` varchar(255),
	`invoiceNumber` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farmExpenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `farmRevenue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`source` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`saleDate` date NOT NULL,
	`buyer` varchar(255),
	`quantity` varchar(100),
	`unit` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farmRevenue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `farmWorkers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(100) NOT NULL,
	`contact` varchar(20),
	`email` varchar(255),
	`hireDate` date NOT NULL,
	`salary` decimal(10,2),
	`salaryFrequency` varchar(20),
	`status` varchar(20) DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farmWorkers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fishPondActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pondId` int NOT NULL,
	`activityType` varchar(50) NOT NULL,
	`activityDate` date NOT NULL,
	`waterTemperature` decimal(5,2),
	`phLevel` decimal(3,1),
	`dissolvedOxygen` decimal(5,2),
	`feedAmount` decimal(10,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fishPondActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fishPonds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`pondName` varchar(255) NOT NULL,
	`sizeSquareMeters` decimal(10,2),
	`depthMeters` decimal(5,2),
	`waterSource` varchar(100),
	`stockingDensity` varchar(100),
	`status` varchar(20) DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fishPonds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fishStockingRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pondId` int NOT NULL,
	`species` varchar(100) NOT NULL,
	`fingerlings` int NOT NULL,
	`stockingDate` date NOT NULL,
	`expectedHarvestDate` date,
	`status` varchar(20) DEFAULT 'stocked',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fishStockingRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `farmAssets` ADD CONSTRAINT `farmAssets_farmId_farms_id_fk` FOREIGN KEY (`farmId`) REFERENCES `farms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `farmExpenses` ADD CONSTRAINT `farmExpenses_farmId_farms_id_fk` FOREIGN KEY (`farmId`) REFERENCES `farms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `farmRevenue` ADD CONSTRAINT `farmRevenue_farmId_farms_id_fk` FOREIGN KEY (`farmId`) REFERENCES `farms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `farmWorkers` ADD CONSTRAINT `farmWorkers_farmId_farms_id_fk` FOREIGN KEY (`farmId`) REFERENCES `farms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fishPondActivities` ADD CONSTRAINT `fishPondActivities_pondId_fishPonds_id_fk` FOREIGN KEY (`pondId`) REFERENCES `fishPonds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fishPonds` ADD CONSTRAINT `fishPonds_farmId_farms_id_fk` FOREIGN KEY (`farmId`) REFERENCES `farms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fishStockingRecords` ADD CONSTRAINT `fishStockingRecords_pondId_fishPonds_id_fk` FOREIGN KEY (`pondId`) REFERENCES `fishPonds`(`id`) ON DELETE no action ON UPDATE no action;