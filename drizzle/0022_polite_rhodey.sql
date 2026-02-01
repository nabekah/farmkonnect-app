CREATE TABLE `inventoryAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`productId` int NOT NULL,
	`threshold` decimal(10,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastAlertSent` timestamp,
	`alertFrequencyHours` int NOT NULL DEFAULT 24,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sellerVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`documentUrl` text NOT NULL,
	`documentType` varchar(100) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sellerVerifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `inventoryAlerts` ADD CONSTRAINT `inventoryAlerts_productId_marketplaceProducts_id_fk` FOREIGN KEY (`productId`) REFERENCES `marketplaceProducts`(`id`) ON DELETE cascade ON UPDATE no action;