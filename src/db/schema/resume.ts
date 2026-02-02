import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { shared } from "./utils/base";

export const resumeCompanies = sqliteTable("resume_companies", {
  ...shared,
  logoUrl: text().notNull(),
  name: text().notNull(),
  websiteUrl: text().notNull(),
});

export const resumeWorkExperiences = sqliteTable("resume_work_experiences", {
  ...shared,
  companyId: text()
    .notNull()
    .references(() => resumeCompanies.id, { onDelete: "cascade" }),
  description: text(),
  endDate: integer({ mode: "timestamp_ms" }),
  location: text().notNull(),
  startDate: integer({ mode: "timestamp_ms" }).notNull(),
  title: text().notNull(),
});

export const resumeProjects = sqliteTable("resume_projects", {
  ...shared,
  description: text().notNull(),
  link: text().notNull(),
  name: text().notNull(),
  tags: text({ mode: "json" }).notNull().$type<string[]>(),
});
