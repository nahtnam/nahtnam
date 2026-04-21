import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/builder";

export const listCompanies = query({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
    return ctx.db.query("resumeCompanies").collect();
  },
});

export const listExperiences = query({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
    return ctx.db.query("resumeEducation").collect();
  },
});

export const listProjects = query({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
    return ctx.db.query("resumeProjects").order("desc").collect();
  },
});

export const createCompany = mutation({
  args: {
    logoUrl: v.string(),
    name: v.string(),
    websiteUrl: v.string(),
  },
  async handler(ctx, args) {
    await requireAdmin(ctx);
    return ctx.db.insert("resumeCompanies", args);
  },
});

export const updateCompany = mutation({
  args: {
    id: v.id("resumeCompanies"),
    logoUrl: v.string(),
    name: v.string(),
    websiteUrl: v.string(),
  },
  async handler(ctx, { id, ...data }) {
    await requireAdmin(ctx);
    await ctx.db.patch("resumeCompanies", id, data);
  },
});

export const deleteCompany = mutation({
  args: { id: v.id("resumeCompanies") },
  async handler(ctx, { id }) {
    await requireAdmin(ctx);
    await ctx.db.delete("resumeCompanies", id);
  },
});

export const createExperience = mutation({
  args: {
    companyId: v.id("resumeCompanies"),
    description: v.optional(v.string()),
    endDate: v.optional(v.number()),
    location: v.string(),
    startDate: v.number(),
    title: v.string(),
  },
  async handler(ctx, args) {
    await requireAdmin(ctx);
    return ctx.db.insert("resumeWorkExperiences", args);
  },
});

export const updateExperience = mutation({
  args: {
    companyId: v.id("resumeCompanies"),
    description: v.optional(v.string()),
    endDate: v.optional(v.number()),
    id: v.id("resumeWorkExperiences"),
    location: v.string(),
    startDate: v.number(),
    title: v.string(),
  },
  async handler(ctx, { id, ...data }) {
    await requireAdmin(ctx);
    await ctx.db.patch("resumeWorkExperiences", id, data);
  },
});

export const deleteExperience = mutation({
  args: { id: v.id("resumeWorkExperiences") },
  async handler(ctx, { id }) {
    await requireAdmin(ctx);
    await ctx.db.delete("resumeWorkExperiences", id);
  },
});

export const createEducation = mutation({
  args: {
    degree: v.string(),
    details: v.optional(v.string()),
    endYear: v.string(),
    school: v.string(),
    startYear: v.string(),
  },
  async handler(ctx, args) {
    await requireAdmin(ctx);
    return ctx.db.insert("resumeEducation", args);
  },
});

export const updateEducation = mutation({
  args: {
    degree: v.string(),
    details: v.optional(v.string()),
    endYear: v.string(),
    id: v.id("resumeEducation"),
    school: v.string(),
    startYear: v.string(),
  },
  async handler(ctx, { id, ...data }) {
    await requireAdmin(ctx);
    await ctx.db.patch("resumeEducation", id, data);
  },
});

export const deleteEducation = mutation({
  args: { id: v.id("resumeEducation") },
  async handler(ctx, { id }) {
    await requireAdmin(ctx);
    await ctx.db.delete("resumeEducation", id);
  },
});

export const createProject = mutation({
  args: {
    description: v.string(),
    link: v.string(),
    name: v.string(),
    tags: v.array(v.string()),
  },
  async handler(ctx, args) {
    await requireAdmin(ctx);
    return ctx.db.insert("resumeProjects", args);
  },
});

export const updateProject = mutation({
  args: {
    description: v.string(),
    id: v.id("resumeProjects"),
    link: v.string(),
    name: v.string(),
    tags: v.array(v.string()),
  },
  async handler(ctx, { id, ...data }) {
    await requireAdmin(ctx);
    await ctx.db.patch("resumeProjects", id, data);
  },
});

export const deleteProject = mutation({
  args: { id: v.id("resumeProjects") },
  async handler(ctx, { id }) {
    await requireAdmin(ctx);
    await ctx.db.delete("resumeProjects", id);
  },
});
