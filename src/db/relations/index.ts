import { defineRelations } from "drizzle-orm";
// biome-ignore lint/performance/noNamespaceImport: drizzle
import * as schema from "@/db/schema";

export const relations = defineRelations(schema, (r) => ({
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
