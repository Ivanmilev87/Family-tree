CREATE TABLE `family_media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`person_id` integer NOT NULL,
	`photo_key` text NOT NULL,
	`caption` text DEFAULT '' NOT NULL,
	`event_date` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_family_media_person_date` ON `family_media` (`person_id`,`event_date`);