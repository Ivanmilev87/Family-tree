ALTER TABLE `people` ADD `gender` text DEFAULT 'unspecified' NOT NULL;--> statement-breakpoint
ALTER TABLE `people` ADD `phone` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `people` ADD `email` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `people` ADD `facebook_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `people` ADD `instagram_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `people` ADD `other_url` text DEFAULT '' NOT NULL;