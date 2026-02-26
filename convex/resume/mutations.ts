import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireAdmin } from "../lib/admin";

export const createCompany = mutation({
  args: {
    adminSecret: v.string(),
    logoUrl: v.string(),
    name: v.string(),
    websiteUrl: v.string(),
  },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, ...data } = args;
    return ctx.db.insert("resumeCompanies", data);
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
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, id, ...data } = args;
    await ctx.db.patch("resumeCompanies", id, data);
  },
});

export const deleteCompany = mutation({
  args: { adminSecret: v.string(), id: v.id("resumeCompanies") },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    await ctx.db.delete("resumeCompanies", args.id);
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
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, ...data } = args;
    return ctx.db.insert("resumeWorkExperiences", data);
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
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, id, ...data } = args;
    await ctx.db.patch("resumeWorkExperiences", id, data);
  },
});

export const deleteExperience = mutation({
  args: { adminSecret: v.string(), id: v.id("resumeWorkExperiences") },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    await ctx.db.delete("resumeWorkExperiences", args.id);
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
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, ...data } = args;
    return ctx.db.insert("resumeEducation", data);
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
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, id, ...data } = args;
    await ctx.db.patch("resumeEducation", id, data);
  },
});

export const deleteEducation = mutation({
  args: { adminSecret: v.string(), id: v.id("resumeEducation") },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    await ctx.db.delete("resumeEducation", args.id);
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
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, ...data } = args;
    return ctx.db.insert("resumeProjects", data);
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
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    const { adminSecret: _, id, ...data } = args;
    await ctx.db.patch("resumeProjects", id, data);
  },
});

export const deleteProject = mutation({
  args: { adminSecret: v.string(), id: v.id("resumeProjects") },
  async handler(ctx, args) {
    requireAdmin(args.adminSecret);
    await ctx.db.delete("resumeProjects", args.id);
  },
});
