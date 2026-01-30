CREATE TABLE `inventory_audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`user_id` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`old_value` varchar(500),
	`new_value` varchar(500),
	`reason` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_forecasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`forecast_date` date NOT NULL,
	`projected_stock` decimal(15,2) NOT NULL,
	`projected_sales` decimal(15,2),
	`forecast_method` varchar(50),
	`confidence` decimal(3,0),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_forecasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`current_stock` decimal(15,2) NOT NULL DEFAULT '0',
	`reserved_stock` decimal(15,2) DEFAULT '0',
	`available_stock` decimal(15,2) DEFAULT '0',
	`minimum_threshold` decimal(15,2) NOT NULL,
	`reorder_quantity` decimal(15,2),
	`last_restocked_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`transaction_type` varchar(50) NOT NULL,
	`quantity` decimal(15,2) NOT NULL,
	`notes` varchar(500),
	`reference_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `low_stock_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`seller_id` int NOT NULL,
	`alert_type` varchar(50) NOT NULL,
	`current_stock` decimal(15,2) NOT NULL,
	`minimum_threshold` decimal(15,2) NOT NULL,
	`acknowledged` boolean DEFAULT false,
	`acknowledged_at` timestamp,
	`acknowledged_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `low_stock_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `inventory_audit_logs` ADD CONSTRAINT `inventory_audit_logs_product_id_marketplaceProducts_id_fk` FOREIGN KEY (`product_id`) REFERENCES `marketplaceProducts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_audit_logs` ADD CONSTRAINT `inventory_audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_forecasts` ADD CONSTRAINT `inventory_forecasts_product_id_marketplaceProducts_id_fk` FOREIGN KEY (`product_id`) REFERENCES `marketplaceProducts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_product_id_marketplaceProducts_id_fk` FOREIGN KEY (`product_id`) REFERENCES `marketplaceProducts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_product_id_marketplaceProducts_id_fk` FOREIGN KEY (`product_id`) REFERENCES `marketplaceProducts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `low_stock_alerts` ADD CONSTRAINT `low_stock_alerts_product_id_marketplaceProducts_id_fk` FOREIGN KEY (`product_id`) REFERENCES `marketplaceProducts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `low_stock_alerts` ADD CONSTRAINT `low_stock_alerts_seller_id_users_id_fk` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `low_stock_alerts` ADD CONSTRAINT `low_stock_alerts_acknowledged_by_users_id_fk` FOREIGN KEY (`acknowledged_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;