ALTER TABLE `orders` ADD `idempotencyKey` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `checkoutFingerprint` varchar(64);--> statement-breakpoint
UPDATE `orders` SET `idempotencyKey` = CONCAT('legacy-', `id`), `checkoutFingerprint` = SHA2(CONCAT('legacy-', `id`), 256) WHERE `idempotencyKey` IS NULL OR `checkoutFingerprint` IS NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY `idempotencyKey` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY `checkoutFingerprint` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_idempotency_unique` UNIQUE(`userId`,`idempotencyKey`);
