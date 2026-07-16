import { convex } from "../fluent";

export const listCompanies = convex
  .query()
  .input({})
  .handler((ctx) => ctx.db.query("resumeCompanies").take(100))
  .public();

export const listExperiences = convex
  .query()
  .input({})
  .handler(async (ctx) => {
    const experiences = await ctx.db
      .query("resumeWorkExperiences")
      .withIndex("by_startDate")
      .order("desc")
      .take(100);

    return Promise.all(
      experiences.map(async (experience) => {
        const company = await ctx.db.get(
          "resumeCompanies",
          experience.companyId
        );

        if (!company) {
          throw new Error(`Missing company for experience ${experience._id}`);
        }

        return { ...experience, company };
      })
    );
  })
  .public();

export const listEducation = convex
  .query()
  .input({})
  .handler((ctx) => ctx.db.query("resumeEducation").take(50))
  .public();

export const listProjects = convex
  .query()
  .input({})
  .handler((ctx) => ctx.db.query("resumeProjects").order("desc").take(100))
  .public();
