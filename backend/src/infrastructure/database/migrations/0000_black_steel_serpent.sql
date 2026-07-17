CREATE TABLE `sales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_id` text NOT NULL,
	`date` text NOT NULL,
	`customer` text NOT NULL,
	`product` text NOT NULL,
	`quantity` integer NOT NULL,
	`amount` text NOT NULL,
	`payment_method` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sales_external_id_unique` ON `sales` (`external_id`);