CREATE TABLE `appliances` (
	`id` text PRIMARY KEY NOT NULL,
	`home_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`brand` text,
	`model` text,
	`installation_date` text,
	`warranty_expiry` text,
	`notes` text,
	FOREIGN KEY (`home_id`) REFERENCES `homes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `appliances_home_id_idx` ON `appliances` (`home_id`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`home_id` text NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`file_url` text,
	`category` text,
	`uploaded_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`home_id`) REFERENCES `homes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `documents_home_id_idx` ON `documents` (`home_id`);--> statement-breakpoint
CREATE INDEX `documents_user_id_idx` ON `documents` (`user_id`);--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`home_id` text NOT NULL,
	`user_id` text,
	`category` text,
	`amount` real NOT NULL,
	`description` text,
	`date` text,
	`notes` text,
	FOREIGN KEY (`home_id`) REFERENCES `homes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `expenses_home_id_idx` ON `expenses` (`home_id`);--> statement-breakpoint
CREATE INDEX `expenses_user_id_idx` ON `expenses` (`user_id`);--> statement-breakpoint
CREATE TABLE `homes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`country` text,
	`state` text,
	`city` text,
	`size_sqft` integer,
	`year_built` integer,
	`notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `homes_user_id_idx` ON `homes` (`user_id`);--> statement-breakpoint
CREATE TABLE `maintenance_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`home_id` text NOT NULL,
	`appliance_id` text,
	`title` text NOT NULL,
	`description` text,
	`category` text,
	`frequency_days` integer,
	`next_due_date` text,
	`last_completed` text,
	`status` text DEFAULT 'pending',
	`priority` text DEFAULT 'normal',
	FOREIGN KEY (`home_id`) REFERENCES `homes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`appliance_id`) REFERENCES `appliances`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `maintenance_tasks_home_id_idx` ON `maintenance_tasks` (`home_id`);--> statement-breakpoint
CREATE INDEX `maintenance_tasks_appliance_id_idx` ON `maintenance_tasks` (`appliance_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text,
	`sender_id` text,
	`receiver_id` text,
	`content` text,
	`read` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`request_id`) REFERENCES `service_requests`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receiver_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messages_request_id_idx` ON `messages` (`request_id`);--> statement-breakpoint
CREATE INDEX `messages_sender_id_idx` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `messages_receiver_id_idx` ON `messages` (`receiver_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text,
	`email` text NOT NULL,
	`avatar_url` text,
	`role` text DEFAULT 'homeowner',
	`phone` text,
	`stripe_customer_id` text,
	`plan` text DEFAULT 'free',
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `profiles` (`email`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`technician_id` text,
	`homeowner_id` text,
	`request_id` text,
	`rating` integer,
	`comment` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`technician_id`) REFERENCES `technicians`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`homeowner_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`request_id`) REFERENCES `service_requests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reviews_technician_id_idx` ON `reviews` (`technician_id`);--> statement-breakpoint
CREATE INDEX `reviews_homeowner_id_idx` ON `reviews` (`homeowner_id`);--> statement-breakpoint
CREATE INDEX `reviews_request_id_idx` ON `reviews` (`request_id`);--> statement-breakpoint
CREATE TABLE `service_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`homeowner_id` text,
	`technician_id` text,
	`home_id` text,
	`title` text,
	`description` text,
	`status` text DEFAULT 'pending',
	`scheduled_date` text,
	`completed_date` text,
	`amount` real,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`homeowner_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`technician_id`) REFERENCES `technicians`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`home_id`) REFERENCES `homes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `service_requests_homeowner_id_idx` ON `service_requests` (`homeowner_id`);--> statement-breakpoint
CREATE INDEX `service_requests_technician_id_idx` ON `service_requests` (`technician_id`);--> statement-breakpoint
CREATE INDEX `service_requests_home_id_idx` ON `service_requests` (`home_id`);--> statement-breakpoint
CREATE TABLE `technicians` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category` text,
	`description` text,
	`hourly_rate` real,
	`country` text,
	`state` text,
	`city` text,
	`is_verified` integer DEFAULT false,
	`is_available` integer DEFAULT true,
	`rating` real DEFAULT 0,
	`total_reviews` integer DEFAULT 0,
	`profile_image` text,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `technicians_user_id_idx` ON `technicians` (`user_id`);