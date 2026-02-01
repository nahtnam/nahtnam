CREATE TABLE `resume_companies` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY,
	`updated_at` integer NOT NULL,
	`logo_url` text NOT NULL,
	`name` text NOT NULL,
	`website_url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resume_work_experiences` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY,
	`updated_at` integer NOT NULL,
	`company_id` text NOT NULL,
	`description` text,
	`end_date` integer,
	`location` text NOT NULL,
	`start_date` integer NOT NULL,
	`title` text NOT NULL,
	CONSTRAINT `fk_resume_work_experiences_company_id_resume_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `resume_companies`(`id`) ON DELETE CASCADE
);
