CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`farmId` int NOT NULL,
	`alertType` varchar(100) NOT NULL,
	`message` text,
	`severity` enum('info','warning','critical') DEFAULT 'warning',
	`isResolved` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `animalHealthRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`animalId` int NOT NULL,
	`recordDate` date NOT NULL,
	`eventType` enum('vaccination','treatment','illness','checkup','other') NOT NULL,
	`details` text,
	`veterinarianUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `animalHealthRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `animalTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`typeName` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `animalTypes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `animals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`typeId` int NOT NULL,
	`uniqueTagId` varchar(100),
	`birthDate` date,
	`gender` enum('male','female','unknown'),
	`breed` varchar(255),
	`status` enum('active','sold','culled','deceased') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `animals_id` PRIMARY KEY(`id`),
	CONSTRAINT `animals_uniqueTagId_unique` UNIQUE(`uniqueTagId`)
);
--> statement-breakpoint
CREATE TABLE `breedingRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`animalId` int NOT NULL,
	`breedingDate` date NOT NULL,
	`sireId` int,
	`damId` int,
	`expectedDueDate` date,
	`outcome` enum('pending','successful','unsuccessful','aborted') DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `breedingRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`reportedByUserId` int NOT NULL,
	`challengeDescription` text NOT NULL,
	`category` varchar(100),
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
	`reportedDate` date NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cropCycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`cropId` int NOT NULL,
	`varietyName` varchar(255),
	`plantingDate` date NOT NULL,
	`expectedHarvestDate` date,
	`actualHarvestDate` date,
	`status` enum('planning','planted','growing','harvesting','completed','abandoned') DEFAULT 'planning',
	`areaPlantedHectares` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cropCycles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cropName` varchar(255) NOT NULL,
	`scientificName` varchar(255),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`attendanceStatus` enum('enrolled','attended','absent','dropped') DEFAULT 'enrolled',
	`feedbackScore` int,
	`feedbackNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `farms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmerUserId` int NOT NULL,
	`farmName` varchar(255) NOT NULL,
	`location` varchar(255),
	`gpsLatitude` decimal(10,8),
	`gpsLongitude` decimal(11,8),
	`sizeHectares` decimal(10,2),
	`farmType` enum('crop','livestock','mixed') DEFAULT 'mixed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedingRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`animalId` int NOT NULL,
	`feedDate` date NOT NULL,
	`feedType` varchar(255) NOT NULL,
	`quantityKg` decimal(8,2) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedingRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fertilizerApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cycleId` int NOT NULL,
	`applicationDate` date NOT NULL,
	`fertilizerType` varchar(255) NOT NULL,
	`quantityKg` decimal(10,2) NOT NULL,
	`appliedByUserId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fertilizerApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iotDevices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`deviceSerial` varchar(100) NOT NULL,
	`deviceType` enum('soil_sensor','weather_station','animal_monitor','water_meter','other') NOT NULL,
	`installationDate` date,
	`status` enum('active','inactive','maintenance','retired') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iotDevices_id` PRIMARY KEY(`id`),
	CONSTRAINT `iotDevices_deviceSerial_unique` UNIQUE(`deviceSerial`)
);
--> statement-breakpoint
CREATE TABLE `kpiValues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kpiId` int NOT NULL,
	`farmId` int,
	`measurementDate` date NOT NULL,
	`actualValue` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kpiValues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kpiName` varchar(255) NOT NULL,
	`description` text,
	`targetValue` decimal(12,2),
	`unitOfMeasure` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kpis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoringVisits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`visitorUserId` int NOT NULL,
	`visitDate` date NOT NULL,
	`observations` text,
	`photoEvidenceUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monitoringVisits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`listingId` int NOT NULL,
	`quantityOrdered` decimal(12,2) NOT NULL,
	`priceAtOrder` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerUserId` int NOT NULL,
	`orderDate` date NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`status` enum('pending','confirmed','fulfilled','cancelled') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`animalId` int NOT NULL,
	`metricDate` date NOT NULL,
	`weightKg` decimal(8,2),
	`milkYieldLiters` decimal(8,2),
	`eggCount` int,
	`otherMetrics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performanceMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productListings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`productType` enum('crop','livestock','processed') NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantityAvailable` decimal(12,2) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`description` text,
	`listingDate` date NOT NULL,
	`status` enum('active','sold_out','delisted') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productListings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sensorReadings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`readingTimestamp` timestamp NOT NULL,
	`readingType` varchar(100) NOT NULL,
	`value` decimal(12,4) NOT NULL,
	`unit` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sensorReadings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `soilTests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`testDate` date NOT NULL,
	`phLevel` decimal(4,2),
	`nitrogenLevel` decimal(8,2),
	`phosphorusLevel` decimal(8,2),
	`potassiumLevel` decimal(8,2),
	`organicMatter` decimal(8,2),
	`recommendations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `soilTests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialistProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`licenseNumber` varchar(100),
	`accreditationStatus` enum('pending','verified','expired','revoked') DEFAULT 'pending',
	`specialization` varchar(255),
	`licenseExpiryDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `specialistProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `strategicGoals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`goalDescription` text NOT NULL,
	`startDate` date,
	`endDate` date,
	`status` enum('planning','in_progress','completed','abandoned') DEFAULT 'planning',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `strategicGoals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `swotAnalysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`analysisDate` date NOT NULL,
	`strengths` text,
	`weaknesses` text,
	`opportunities` text,
	`threats` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `swotAnalysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainingPrograms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetAudience` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainingPrograms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainingSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`sessionDate` date NOT NULL,
	`location` varchar(255),
	`trainerUserId` int,
	`maxParticipants` int,
	`status` enum('scheduled','ongoing','completed','cancelled') DEFAULT 'scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trainingSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transportRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`transporterUserId` int,
	`pickupLocation` varchar(255) NOT NULL,
	`deliveryLocation` varchar(255) NOT NULL,
	`requestDate` date NOT NULL,
	`estimatedDeliveryDate` date,
	`actualDeliveryDate` date,
	`status` enum('requested','accepted','in_transit','delivered','cancelled') DEFAULT 'requested',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transportRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yieldRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cycleId` int NOT NULL,
	`yieldQuantityKg` decimal(12,2) NOT NULL,
	`qualityGrade` varchar(50),
	`postHarvestLossKg` decimal(10,2),
	`recordedDate` date NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `yieldRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('farmer','agent','veterinarian','buyer','transporter','admin','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);