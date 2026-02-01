CREATE TABLE `marketplaceBulkPricingTiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`minQuantity` decimal(10,2) NOT NULL,
	`maxQuantity` decimal(10,2),
	`discountPercentage` decimal(5,2) NOT NULL,
	`discountedPrice` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceBulkPricingTiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceDeliveryZones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`region` varchar(100) NOT NULL,
	`shippingCost` decimal(10,2) NOT NULL,
	`estimatedDays` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceDeliveryZones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceProductReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`verifiedPurchase` boolean NOT NULL DEFAULT false,
	`helpfulCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceProductReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `marketplaceBulkPricingTiers` ADD CONSTRAINT `marketplaceBulkPricingTiers_productId_marketplaceProducts_id_fk` FOREIGN KEY (`productId`) REFERENCES `marketplaceProducts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceProductReviews` ADD CONSTRAINT `marketplaceProductReviews_productId_marketplaceProducts_id_fk` FOREIGN KEY (`productId`) REFERENCES `marketplaceProducts`(`id`) ON DELETE cascade ON UPDATE no action;