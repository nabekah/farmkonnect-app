CREATE TABLE `marketplaceCart` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceCart_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceOrderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketplaceOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','confirmed','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
	`deliveryAddress` text,
	`deliveryDate` date,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketplaceOrders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`farmId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`productType` varchar(100) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`imageUrl` varchar(500),
	`status` enum('active','inactive','sold_out','discontinued') NOT NULL DEFAULT 'active',
	`rating` decimal(3,2) DEFAULT '0',
	`reviewCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`buyerId` int NOT NULL,
	`orderId` int,
	`rating` int NOT NULL,
	`title` varchar(255),
	`comment` text,
	`helpful` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`transactionId` varchar(100),
	`amount` decimal(10,2) NOT NULL,
	`paymentMethod` varchar(50) NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`reference` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `marketplaceTransactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketplaceTransactions_transactionId_unique` UNIQUE(`transactionId`)
);
