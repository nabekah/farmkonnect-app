CREATE TABLE `irrigation_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schedule_id` int NOT NULL,
	`zone_id` int NOT NULL,
	`event_type` varchar(50) NOT NULL,
	`start_time` timestamp NOT NULL,
	`end_time` timestamp,
	`duration_minutes` int,
	`water_applied_liters` decimal(15,2),
	`reason` varchar(500),
	`status` varchar(50) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `irrigation_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `irrigation_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zone_id` int NOT NULL,
	`recommendation_type` varchar(50) NOT NULL,
	`priority` varchar(50) NOT NULL,
	`reason` varchar(500) NOT NULL,
	`recommended_duration_minutes` int,
	`estimated_water_needed` decimal(15,2),
	`weather_factor` decimal(5,2),
	`soil_moisture_factor` decimal(5,2),
	`crop_water_requirement` decimal(10,2),
	`acknowledged` boolean DEFAULT false,
	`acknowledged_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `irrigation_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `irrigation_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zone_id` int NOT NULL,
	`schedule_name` varchar(255) NOT NULL,
	`schedule_type` varchar(50) NOT NULL,
	`duration_minutes` int NOT NULL,
	`flow_rate_liters_per_min` decimal(10,2),
	`frequency` varchar(50),
	`start_time` varchar(8),
	`end_time` varchar(8),
	`days_of_week` varchar(100),
	`weather_adjustment` boolean DEFAULT true,
	`enabled` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `irrigation_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `irrigation_statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zone_id` int NOT NULL,
	`date_start` date NOT NULL,
	`date_end` date NOT NULL,
	`total_water_applied_liters` decimal(15,2) DEFAULT '0',
	`total_duration_minutes` int DEFAULT 0,
	`irrigation_event_count` int DEFAULT 0,
	`average_moisture` decimal(5,2),
	`rainfall_mm` decimal(10,2),
	`water_efficiency` decimal(5,2),
	`cost_estimate` decimal(10,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `irrigation_statistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `irrigation_zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farm_id` int NOT NULL,
	`zone_name` varchar(255) NOT NULL,
	`crop_type` varchar(100) NOT NULL,
	`area_hectares` decimal(10,2),
	`soil_type` varchar(100),
	`field_capacity` decimal(5,2),
	`wilting_point` decimal(5,2),
	`target_moisture` decimal(5,2),
	`min_moisture` decimal(5,2),
	`max_moisture` decimal(5,2),
	`status` varchar(50) DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `irrigation_zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `soil_moisture_readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zone_id` int NOT NULL,
	`sensor_id` int,
	`moisture_percentage` decimal(5,2) NOT NULL,
	`temperature` decimal(5,2),
	`conductivity` decimal(10,2),
	`ph` decimal(3,1),
	`reading_time` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `soil_moisture_readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `irrigation_events` ADD CONSTRAINT `irrigation_events_schedule_id_irrigation_schedules_id_fk` FOREIGN KEY (`schedule_id`) REFERENCES `irrigation_schedules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `irrigation_events` ADD CONSTRAINT `irrigation_events_zone_id_irrigation_zones_id_fk` FOREIGN KEY (`zone_id`) REFERENCES `irrigation_zones`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `irrigation_recommendations` ADD CONSTRAINT `irrigation_recommendations_zone_id_irrigation_zones_id_fk` FOREIGN KEY (`zone_id`) REFERENCES `irrigation_zones`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `irrigation_schedules` ADD CONSTRAINT `irrigation_schedules_zone_id_irrigation_zones_id_fk` FOREIGN KEY (`zone_id`) REFERENCES `irrigation_zones`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `irrigation_statistics` ADD CONSTRAINT `irrigation_statistics_zone_id_irrigation_zones_id_fk` FOREIGN KEY (`zone_id`) REFERENCES `irrigation_zones`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `irrigation_zones` ADD CONSTRAINT `irrigation_zones_farm_id_farms_id_fk` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `soil_moisture_readings` ADD CONSTRAINT `soil_moisture_readings_zone_id_irrigation_zones_id_fk` FOREIGN KEY (`zone_id`) REFERENCES `irrigation_zones`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `soil_moisture_readings` ADD CONSTRAINT `soil_moisture_readings_sensor_id_iotDevices_id_fk` FOREIGN KEY (`sensor_id`) REFERENCES `iotDevices`(`id`) ON DELETE set null ON UPDATE no action;