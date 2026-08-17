CREATE INDEX `idx_people_generation_birth` ON `people` (`generation`,`birth_year`);
--> statement-breakpoint
PRAGMA optimize;
