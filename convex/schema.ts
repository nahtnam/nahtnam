import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  blogCategories: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  blogPosts: defineTable({
    categoryId: v.id("blogCategories"),
    content: v.string(),
    excerpt: v.string(),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_publishedAt", ["publishedAt"]),

  resumeCompanies: defineTable({
    logoUrl: v.string(),
    name: v.string(),
    websiteUrl: v.string(),
  }),

  resumeEducation: defineTable({
    degree: v.string(),
    details: v.optional(v.string()),
    endYear: v.string(),
    school: v.string(),
    startYear: v.string(),
  }),

  resumeProjects: defineTable({
    description: v.string(),
    link: v.string(),
    name: v.string(),
    tags: v.array(v.string()),
  }),

  resumeWorkExperiences: defineTable({
    companyId: v.id("resumeCompanies"),
    description: v.optional(v.string()),
    endDate: v.optional(v.number()),
    location: v.string(),
    startDate: v.number(),
    title: v.string(),
  }).index("by_startDate", ["startDate"]),

  travelFlights: defineTable({
    aircraftType: v.string(),
    airline: v.string(),
    date: v.string(),
    flightNumber: v.string(),
    flightyId: v.optional(v.string()),
    from: v.string(),
    to: v.string(),
  })
    .index("by_date", ["date"])
    .index("by_flightyId", ["flightyId"]),
});
