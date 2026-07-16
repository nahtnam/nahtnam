import { ConvexError, v } from "convex/values";

import { adminMutation, adminQuery } from "../fluent";

export const listCompanies = adminQuery
  .input({})
  .handler((ctx) => ctx.db.query("resumeCompanies").take(100))
  .public();

export const listExperiences = adminQuery
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

export const listEducation = adminQuery
  .input({})
  .handler((ctx) => ctx.db.query("resumeEducation").take(50))
  .public();

export const listProjects = adminQuery
  .input({})
  .handler((ctx) => ctx.db.query("resumeProjects").order("desc").take(100))
  .public();

export const createCompany = adminMutation
  .input({
    logoUrl: v.string(),
    name: v.string(),
    websiteUrl: v.string(),
  })
  .handler((ctx, args) => ctx.db.insert("resumeCompanies", args))
  .public();

export const updateCompany = adminMutation
  .input({
    id: v.id("resumeCompanies"),
    logoUrl: v.string(),
    name: v.string(),
    websiteUrl: v.string(),
  })
  .handler(async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch("resumeCompanies", id, data);
    return null;
  })
  .public();

export const deleteCompany = adminMutation
  .input({ id: v.id("resumeCompanies") })
  .handler(async (ctx, args) => {
    const experience = await ctx.db
      .query("resumeWorkExperiences")
      .withIndex("by_companyId", (query) => query.eq("companyId", args.id))
      .first();

    if (experience) {
      throw new ConvexError({
        code: "CONFLICT",
        message: "Delete or reassign this company's work experiences first",
      });
    }

    await ctx.db.delete("resumeCompanies", args.id);
    return null;
  })
  .public();

export const createExperience = adminMutation
  .input({
    companyId: v.id("resumeCompanies"),
    description: v.optional(v.string()),
    endDate: v.optional(v.number()),
    location: v.string(),
    startDate: v.number(),
    title: v.string(),
  })
  .handler(async (ctx, args) => {
    const company = await ctx.db.get("resumeCompanies", args.companyId);

    if (!company) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Company not found",
      });
    }

    return ctx.db.insert("resumeWorkExperiences", args);
  })
  .public();

export const updateExperience = adminMutation
  .input({
    companyId: v.id("resumeCompanies"),
    description: v.optional(v.string()),
    endDate: v.optional(v.number()),
    id: v.id("resumeWorkExperiences"),
    location: v.string(),
    startDate: v.number(),
    title: v.string(),
  })
  .handler(async (ctx, args) => {
    const { id, ...data } = args;
    const company = await ctx.db.get("resumeCompanies", data.companyId);

    if (!company) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Company not found",
      });
    }

    await ctx.db.patch("resumeWorkExperiences", id, data);
    return null;
  })
  .public();

export const deleteExperience = adminMutation
  .input({ id: v.id("resumeWorkExperiences") })
  .handler(async (ctx, args) => {
    await ctx.db.delete("resumeWorkExperiences", args.id);
    return null;
  })
  .public();

export const createEducation = adminMutation
  .input({
    degree: v.string(),
    details: v.optional(v.string()),
    endYear: v.string(),
    school: v.string(),
    startYear: v.string(),
  })
  .handler((ctx, args) => ctx.db.insert("resumeEducation", args))
  .public();

export const updateEducation = adminMutation
  .input({
    degree: v.string(),
    details: v.optional(v.string()),
    endYear: v.string(),
    id: v.id("resumeEducation"),
    school: v.string(),
    startYear: v.string(),
  })
  .handler(async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch("resumeEducation", id, data);
    return null;
  })
  .public();

export const deleteEducation = adminMutation
  .input({ id: v.id("resumeEducation") })
  .handler(async (ctx, args) => {
    await ctx.db.delete("resumeEducation", args.id);
    return null;
  })
  .public();

export const createProject = adminMutation
  .input({
    description: v.string(),
    link: v.string(),
    name: v.string(),
    tags: v.array(v.string()),
  })
  .handler((ctx, args) => ctx.db.insert("resumeProjects", args))
  .public();

export const updateProject = adminMutation
  .input({
    description: v.string(),
    id: v.id("resumeProjects"),
    link: v.string(),
    name: v.string(),
    tags: v.array(v.string()),
  })
  .handler(async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch("resumeProjects", id, data);
    return null;
  })
  .public();

export const deleteProject = adminMutation
  .input({ id: v.id("resumeProjects") })
  .handler(async (ctx, args) => {
    await ctx.db.delete("resumeProjects", args.id);
    return null;
  })
  .public();
