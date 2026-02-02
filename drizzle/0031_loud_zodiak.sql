CREATE TABLE `costAnalysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cycleId` int NOT NULL,
	`totalCostSpent` decimal(12,2) NOT NULL,
	`costPerHectare` decimal(10,2) NOT NULL,
	`costPerKgYield` decimal(10,4),
	`roiPercentage` decimal(8,2),
	`averageCostPerApplication` decimal(10,2),
	`mostExpensiveType` varchar(100),
	`analysisDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `costAnalysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fertilizerCosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fertilizerType` varchar(100) NOT NULL,
	`supplier` varchar(255),
	`costPerKg` decimal(10,4) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`effectiveDate` date NOT NULL,
	`expiryDate` date,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fertilizerCosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fertilizer_inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`fertilizerType` varchar(100) NOT NULL,
	`currentStock` decimal(12,2) NOT NULL,
	`unit` varchar(20) NOT NULL DEFAULT 'kg',
	`reorderPoint` decimal(12,2) NOT NULL,
	`reorderQuantity` decimal(12,2) NOT NULL,
	`supplier` varchar(255),
	`supplierContact` varchar(255),
	`lastRestockDate` date,
	`expiryDate` date,
	`storageLocation` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fertilizer_inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fertilizer_inventory_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inventoryId` int NOT NULL,
	`transactionType` enum('purchase','usage','adjustment','damage','expiry') NOT NULL,
	`quantity` decimal(12,2) NOT NULL,
	`unit` varchar(20) NOT NULL DEFAULT 'kg',
	`cost` decimal(12,2),
	`reason` text,
	`referenceId` int,
	`transactionDate` date NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fertilizer_inventory_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `soilHealthRecommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`soilTestId` int NOT NULL,
	`cycleId` int NOT NULL,
	`recommendedFertilizerType` varchar(100) NOT NULL,
	`recommendedQuantityKg` decimal(10,2) NOT NULL,
	`applicationTiming` varchar(100),
	`deficiencyType` varchar(100),
	`deficiencySeverity` enum('low','moderate','high','critical') NOT NULL,
	`expectedYieldImprovement` decimal(8,2),
	`costBenefit` decimal(10,2),
	`alternativeOptions` text,
	`implementationStatus` enum('pending','applied','completed','cancelled') NOT NULL DEFAULT 'pending',
	`appliedDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `soilHealthRecommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `costAnalysis` ADD CONSTRAINT `costAnalysis_cycleId_cropCycles_id_fk` FOREIGN KEY (`cycleId`) REFERENCES `cropCycles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fertilizer_inventory` ADD CONSTRAINT `fertilizer_inventory_farmId_farms_id_fk` FOREIGN KEY (`farmId`) REFERENCES `farms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fertilizer_inventory_transactions` ADD CONSTRAINT `fertilizer_inventory_transactions_inventoryId_fertilizer_inventory_id_fk` FOREIGN KEY (`inventoryId`) REFERENCES `fertilizer_inventory`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `soilHealthRecommendations` ADD CONSTRAINT `soilHealthRecommendations_soilTestId_soilTests_id_fk` FOREIGN KEY (`soilTestId`) REFERENCES `soilTests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `soilHealthRecommendations` ADD CONSTRAINT `soilHealthRecommendations_cycleId_cropCycles_id_fk` FOREIGN KEY (`cycleId`) REFERENCES `cropCycles`(`id`) ON DELETE no action ON UPDATE no action;