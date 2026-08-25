CREATE TABLE `productVariants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`label` varchar(120) NOT NULL,
	`referenceLabelEn` varchar(120),
	`sku` varchar(100) NOT NULL,
	`priceAmount` int NOT NULL,
	`compareAtAmount` int,
	`stock` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isStagingFixture` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productVariants_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_variants_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
ALTER TABLE `orderItems` ADD `variantId` int;--> statement-breakpoint
ALTER TABLE `orderItems` ADD `variantLabel` varchar(120);--> statement-breakpoint
ALTER TABLE `orders` ADD `isStagingFixture` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `sku` varchar(80);--> statement-breakpoint
ALTER TABLE `products` ADD `referenceDescriptionEn` text;--> statement-breakpoint
ALTER TABLE `products` ADD `compareAtAmount` int;--> statement-breakpoint
ALTER TABLE `products` ADD `isStagingFixture` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_sku_unique` UNIQUE(`sku`);--> statement-breakpoint
ALTER TABLE `productVariants` ADD CONSTRAINT `productVariants_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `product_variants_product_idx` ON `productVariants` (`productId`,`isActive`,`sortOrder`);--> statement-breakpoint
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_variantId_productVariants_id_fk` FOREIGN KEY (`variantId`) REFERENCES `productVariants`(`id`) ON DELETE restrict ON UPDATE no action;