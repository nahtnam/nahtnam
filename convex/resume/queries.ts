import { query } from "../_generated/server";

export const listCompanies = query({
  args: {},
  async handler(ctx) {
    return ctx.db.query("resumeCompanies").collect();
  },
});

export const listExperiences = query({
  args: {},
  async handler(ctx) {
    const experiences = await ctx.db
      .query("resumeWorkExperiences")
      .withIndex("by_startDate")
      .order("desc")
      .collect();

    const experiencesWithCompany = await Promise.all(
      experiences.map(async (exp) => {
        const company = await ctx.db.get("resumeCompanies", exp.companyId);
        return { ...exp, company: company! };
      }),
    );

    return experiencesWithCompany;
  },
});

export const listEducation = query({
  args: {},
  async handler(ctx) {
    const education = await ctx.db.query("resumeEducation").collect();
    return education;
  },
});

export const listProjects = query({
  args: {},
  async handler(ctx) {
    const projects = await ctx.db
      .query("resumeProjects")
      .order("desc")
      .collect();
    return projects;
  },
});
