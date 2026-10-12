CREATE TABLE `beach_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `forecast_cache` (
	`beach` text PRIMARY KEY NOT NULL,
	`attempt_hour` integer NOT NULL,
	`fetched_at` integer,
	`body` text,
	`status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `provider_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`fetched_at` integer NOT NULL
);
