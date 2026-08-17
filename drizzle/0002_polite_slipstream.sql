CREATE TABLE `relationships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`person_id` integer NOT NULL,
	`related_person_id` integer NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`related_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_relationships_unique` ON `relationships` (`person_id`,`related_person_id`,`type`);--> statement-breakpoint
CREATE INDEX `idx_relationships_related` ON `relationships` (`related_person_id`,`type`);
--> statement-breakpoint
PRAGMA optimize;
