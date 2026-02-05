CREATE TABLE `taskHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`historyId` varchar(50) NOT NULL,
	`taskId` varchar(50) NOT NULL,
	`changedByUserId` int NOT NULL,
	`changeType` enum('created','status_changed','priority_changed','due_date_changed','reassigned','notes_added','completed','cancelled','edited') NOT NULL,
	`oldValue` text,
	`newValue` text,
	`fieldChanged` varchar(100),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taskHistory_id` PRIMARY KEY(`id`),
	CONSTRAINT `taskHistory_historyId_unique` UNIQUE(`historyId`)
);
