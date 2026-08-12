CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(200) NOT NULL,
	`imageUrl` varchar(1000),
	`unitPriceAmount` int NOT NULL,
	`quantity` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`userId` int,
	`customerName` varchar(160) NOT NULL,
	`customerPhone` varchar(40) NOT NULL,
	`customerEmail` varchar(320),
	`shippingAddress` text NOT NULL,
	`notes` text,
	`paymentMethod` enum('cash_on_delivery','instapay') NOT NULL,
	`paymentStatus` enum('not_required','awaiting_proof','under_review','verified','rejected') NOT NULL DEFAULT 'not_required',
	`status` enum('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`subtotalAmount` int NOT NULL,
	`shippingAmount` int NOT NULL DEFAULT 0,
	`totalAmount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_number_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `paymentProofs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`url` varchar(1000) NOT NULL,
	`originalFilename` varchar(255) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paymentProofs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`url` varchar(1000) NOT NULL,
	`altText` varchar(255),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int,
	`name` varchar(200) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`description` text,
	`priceAmount` int NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `storeSettings` (
	`id` int NOT NULL,
	`storeName` varchar(120) NOT NULL DEFAULT 'Mousa Glass',
	`whatsappNumber` varchar(30) NOT NULL DEFAULT '201020848619',
	`instaPayHandle` varchar(160),
	`currency` varchar(8) NOT NULL DEFAULT 'EGP',
	`shippingFeeAmount` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `orderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `orders_customer_idx` ON `orders` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `payment_proofs_order_idx` ON `paymentProofs` (`orderId`);--> statement-breakpoint
CREATE INDEX `product_images_product_idx` ON `productImages` (`productId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`categoryId`);--> statement-breakpoint
CREATE INDEX `products_catalog_idx` ON `products` (`isActive`,`isFeatured`);