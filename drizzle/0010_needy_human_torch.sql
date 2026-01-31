CREATE TABLE `accountStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`previousStatus` enum('active','disabled','suspended') NOT NULL,
	`newStatus` enum('active','disabled','suspended') NOT NULL,
	`reason` text,
	`changedBy` int NOT NULL,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleName` varchar(100) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`description` text,
	`isSystemRole` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customRoles_id` PRIMARY KEY(`id`),
	CONSTRAINT `customRoles_roleName_unique` UNIQUE(`roleName`)
);
--> statement-breakpoint
CREATE TABLE `mfaBackupCodeUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`codeHash` varchar(255) NOT NULL,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(45),
	CONSTRAINT `mfaBackupCodeUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modulePermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleName` varchar(100) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `modulePermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rolePermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleId` int NOT NULL,
	`permissionId` int NOT NULL,
	`canView` boolean NOT NULL DEFAULT false,
	`canCreate` boolean NOT NULL DEFAULT false,
	`canEdit` boolean NOT NULL DEFAULT false,
	`canDelete` boolean NOT NULL DEFAULT false,
	`canExport` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rolePermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `securityAuditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` enum('login_success','login_failed','logout','mfa_enabled','mfa_disabled','mfa_verified','mfa_failed','password_changed','role_assigned','role_removed','permission_changed','account_approved','account_rejected','account_disabled','account_enabled','account_suspended','session_created','session_terminated','security_alert') NOT NULL,
	`eventDescription` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`deviceFingerprint` varchar(255),
	`metadata` text,
	`severity` enum('low','medium','high','critical') DEFAULT 'low',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `securityAuditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `securitySettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text NOT NULL,
	`description` text,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `securitySettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `securitySettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `userApprovalRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`requestedRole` varchar(100),
	`justification` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userApprovalRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roleId` int NOT NULL,
	`assignedBy` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userRoles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionToken` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`deviceFingerprint` varchar(255),
	`deviceName` varchar(255),
	`lastActivity` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `accountStatus` enum('active','disabled','suspended') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `accountStatusReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `mfaEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `mfaSecret` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `mfaBackupCodes` text;--> statement-breakpoint
ALTER TABLE `users` ADD `failedLoginAttempts` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastFailedLoginAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `accountLockedUntil` timestamp;