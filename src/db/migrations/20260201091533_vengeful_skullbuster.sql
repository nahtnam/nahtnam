CREATE TABLE `resume_companies` (
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`logo_url` text NOT NULL,
	`name` text NOT NULL,
	`website_url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resume_work_experiences` (
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`company_id` text NOT NULL,
	`description` text,
	`end_date` integer,
	`location` text NOT NULL,
	`start_date` integer NOT NULL,
	`title` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `resume_companies`(`id`) ON UPDATE no action ON DELETE cascade
);
