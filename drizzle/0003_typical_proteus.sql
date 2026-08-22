CREATE TABLE `operationMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operation` varchar(64) NOT NULL,
	`provider` varchar(64) NOT NULL,
	`estimatedCostMicros` int NOT NULL DEFAULT 0,
	`inputBytes` int NOT NULL DEFAULT 0,
	`outputBytes` int NOT NULL DEFAULT 0,
	`status` enum('success','failure') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `operationMetrics_id` PRIMARY KEY(`id`)
);
