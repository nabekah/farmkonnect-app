ALTER TABLE `userApprovalRequests` MODIFY COLUMN `userId` int;--> statement-breakpoint
ALTER TABLE `userApprovalRequests` ADD `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `userApprovalRequests` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `userApprovalRequests` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `userApprovalRequests` ADD `requestedAt` timestamp DEFAULT (now()) NOT NULL;