import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/builder";

export const listCompanies = query({
  args: { adminSecret: v.string() },
  async handler(ctx, { adminSecret }) {
    requireAdmin(adminSecret);
    return ctx.db.query("resumeCompanies").collect();
  },
});

export const listExperiences = query({
  args: { adminSecret: v.string() },
  async handler(ctx, { adminSecret }) {
    requireAdmin(adminSecret);
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
  args: { adminSecret: v.string() },
  async handler(ctx, { adminSecret }) {
    requireAdmin(adminSecret);
    return ctx.db.query("resumeEducation").collect();
  },
});

export const listProjects = query({
  args: { adminSecret: v.string() },
  async handler(ctx, { adminSecret }) {
    requireAdmin(adminSecret);
    return ctx.db.query("resumeProjects").order("desc").collect();
  },
});

export const createCompany = mutation({
  args: {
    adminSecret: v.string(),
    logoUrl: v.string(),
    name: v.string(),
    websiteUrl: v.string(),
  },
  async handler(ctx, { adminSecret, ...args }) {
    requireAdmin(adminSecret);
    return ctx.db.insert("resumeCompanies", args);
  },
});

export const updateCompany = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("resumeCompanies"),
    logoUrl: v.string(),
    name: v.string(),
    websiteUrl: v.string(),
  },
  async handler(ctx, { adminSecret, id, ...data }) {
    requireAdmin(adminSecret);
    await ctx.db.patch("resumeCompanies", id, data);
  },
});

export const deleteCompany = mutation({
  args: { adminSecret: v.string(), id: v.id("resumeCompanies") },
  async handler(ctx, { adminSecret, id }) {
    requireAdmin(adminSecret);
    await ctx.db.delete("resumeCompanies", id);
  },
});

export const createExperience = mutation({
  args: {
    adminSecret: v.string(),
    companyId: v.id("resumeCompanies"),
    description: v.optional(v.string()),
    endDate: v.optional(v.number()),
    location: v.string(),
    startDate: v.number(),
    title: v.string(),
  },
  async handler(ctx, { adminSecret, ...args }) {
    requireAdmin(adminSecret);
    return ctx.db.insert("resumeWorkExperiences", args);
  },
});

export const updateExperience = mutation({
  args: {
    adminSecret: v.string(),
    companyId: v.id("resumeCompanies"),
    description: v.optional(v.string()),
    endDate: v.optional(v.number()),
    id: v.id("resumeWorkExperiences"),
    location: v.string(),
    startDate: v.number(),
    title: v.string(),
  },
  async handler(ctx, { adminSecret, id, ...data }) {
    requireAdmin(adminSecret);
    await ctx.db.patch("resumeWorkExperiences", id, data);
  },
});

export const deleteExperience = mutation({
  args: { adminSecret: v.string(), id: v.id("resumeWorkExperiences") },
  async handler(ctx, { adminSecret, id }) {
    requireAdmin(adminSecret);
    await ctx.db.delete("resumeWorkExperiences", id);
  },
});

export const createEducation = mutation({
  args: {
    adminSecret: v.string(),
    degree: v.string(),
    details: v.optional(v.string()),
    endYear: v.string(),
    school: v.string(),
    startYear: v.string(),
  },
  async handler(ctx, { adminSecret, ...args }) {
    requireAdmin(adminSecret);
    return ctx.db.insert("resumeEducation", args);
  },
});

export const updateEducation = mutation({
  args: {
    adminSecret: v.string(),
    degree: v.string(),
    details: v.optional(v.string()),
    endYear: v.string(),
    id: v.id("resumeEducation"),
    school: v.string(),
    startYear: v.string(),
  },
  async handler(ctx, { adminSecret, id, ...data }) {
    requireAdmin(adminSecret);
    await ctx.db.patch("resumeEducation", id, data);
  },
});

export const deleteEducation = mutation({
  args: { adminSecret: v.string(), id: v.id("resumeEducation") },
  async handler(ctx, { adminSecret, id }) {
    requireAdmin(adminSecret);
    await ctx.db.delete("resumeEducation", id);
  },
});

export const createProject = mutation({
  args: {
    adminSecret: v.string(),
    description: v.string(),
    link: v.string(),
    name: v.string(),
    tags: v.array(v.string()),
  },
  async handler(ctx, { adminSecret, ...args }) {
    requireAdmin(adminSecret);
    return ctx.db.insert("resumeProjects", args);
  },
});

export const updateProject = mutation({
  args: {
    adminSecret: v.string(),
    description: v.string(),
    id: v.id("resumeProjects"),
    link: v.string(),
    name: v.string(),
    tags: v.array(v.string()),
  },
  async handler(ctx, { adminSecret, id, ...data }) {
    requireAdmin(adminSecret);
    await ctx.db.patch("resumeProjects", id, data);
  },
});

export const deleteProject = mutation({
  args: { adminSecret: v.string(), id: v.id("resumeProjects") },
  async handler(ctx, { adminSecret, id }) {
    requireAdmin(adminSecret);
    await ctx.db.delete("resumeProjects", id);
  },
});
