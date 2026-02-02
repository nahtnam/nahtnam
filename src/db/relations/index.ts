import { defineRelations } from "drizzle-orm";
// biome-ignore lint/performance/noNamespaceImport: drizzle
import * as schema from "@/db/schema";

export const relations = defineRelations(schema, (r) => ({
  blogCategories: {
    posts: r.many.blogPosts({
      from: r.blogCategories.id,
      to: r.blogPosts.categoryId,
    }),
  },
  blogPosts: {
    category: r.one.blogCategories({
      from: r.blogPosts.categoryId,
      optional: false,
      to: r.blogCategories.id,
    }),
  },
  resumeCompanies: {
    experiences: r.many.resumeWorkExperiences({
      from: r.resumeCompanies.id,
      to: r.resumeWorkExperiences.companyId,
    }),
  },
  resumeWorkExperiences: {
    company: r.one.resumeCompanies({
      from: r.resumeWorkExperiences.companyId,
      optional: false,
      to: r.resumeCompanies.id,
    }),
  },
}));
