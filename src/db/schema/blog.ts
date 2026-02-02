import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { shared } from "./utils/base";

export const blogCategories = sqliteTable("blog_categories", {
  ...shared,
  name: text().notNull().unique(),
});

export const blogPosts = sqliteTable("blog_posts", {
  ...shared,
  categoryId: text()
    .notNull()
    .references(() => blogCategories.id, { onDelete: "cascade" }),
  content: text().notNull(),
  excerpt: text().notNull(),
  publishedAt: integer({ mode: "timestamp_ms" }).notNull(),
  slug: text().notNull().unique(),
  title: text().notNull(),
});
