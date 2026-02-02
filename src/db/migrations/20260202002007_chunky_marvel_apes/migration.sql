CREATE TABLE `blog_categories` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY,
	`updated_at` integer NOT NULL,
	`category_id` text NOT NULL,
	`content` text NOT NULL,
	`excerpt` text NOT NULL,
	`published_at` integer NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`title` text NOT NULL,
	CONSTRAINT `fk_blog_posts_category_id_blog_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE CASCADE
);
