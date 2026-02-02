CREATE TABLE `resume_projects` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY,
	`updated_at` integer NOT NULL,
	`description` text NOT NULL,
	`link` text NOT NULL,
	`name` text NOT NULL,
	`tags` text NOT NULL
);
