CREATE TABLE `sharedRateLimitBuckets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scope` varchar(64) NOT NULL,
	`keyHash` varchar(64) NOT NULL,
	`windowStartMs` bigint NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sharedRateLimitBuckets_id` PRIMARY KEY(`id`),
	CONSTRAINT `shared_rate_limit_scope_key_window_unique` UNIQUE(`scope`,`keyHash`,`windowStartMs`)
);
--> statement-breakpoint
CREATE INDEX `shared_rate_limit_window_idx` ON `sharedRateLimitBuckets` (`windowStartMs`);