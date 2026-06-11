CREATE TABLE `atsAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`jobDescription` text NOT NULL,
	`score` int NOT NULL,
	`missingKeywords` json,
	`suggestions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `atsAnalyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`details` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`cvData` json NOT NULL,
	`pdfUrl` varchar(512),
	`atsScore` int,
	`status` enum('draft','generated','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `privacyRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('data_export','account_deletion','data_correction') NOT NULL,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`exportUrl` varchar(512),
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`expiresAt` timestamp,
	CONSTRAINT `privacyRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('purchase','usage','refund','admin_adjustment') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`stripePaymentId` varchar(255),
	`stripeChargeId` varchar(255),
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `creditsBalance` decimal(10,2) DEFAULT '1' NOT NULL;