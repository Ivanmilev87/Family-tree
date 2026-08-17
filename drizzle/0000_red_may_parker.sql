CREATE TABLE `people` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`birth_year` integer,
	`death_year` integer,
	`generation` integer DEFAULT 0 NOT NULL,
	`branch` text DEFAULT '' NOT NULL,
	`relation` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`story` text DEFAULT '' NOT NULL,
	`traits` text DEFAULT '' NOT NULL,
	`health_notes` text DEFAULT '' NOT NULL,
	`health_private` integer DEFAULT 1 NOT NULL,
	`photo_key` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
