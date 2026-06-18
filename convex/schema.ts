import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  blogCategories: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  blogMedia: defineTable({
    contentType: v.optional(v.string()),
    createdAt: v.number(),
    name: v.string(),
    postId: v.optional(v.id("blogPosts")),
    storageId: v.id("_storage"),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_postId", ["postId"]),

  blogPosts: defineTable({
    categoryId: v.id("blogCategories"),
    content: v.string(),
    contentPath: v.optional(v.string()),
    excerpt: v.string(),
    kind: v.optional(v.union(v.literal("markdown"), v.literal("x"))),
    published: v.optional(v.boolean()),
    publishedAt: v.number(),
    slug: v.string(),
    title: v.string(),
    tweetIds: v.optional(v.array(v.string())),
    tweets: v.optional(
      v.array(
        v.object({
          fetchedAt: v.number(),
          id: v.string(),
          sourceUrl: v.string(),
          tweet: v.any(),
        }),
      ),
    ),
    tweetsFetchedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_published_slug", ["published", "slug"])
    .index("by_published_publishedAt", ["published", "publishedAt"])
    .index("by_publishedAt", ["publishedAt"]),

  bnbBookings: defineTable({
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.array(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
  }).index("by_status", ["status"]),

  golfRItems: defineTable({
    attachments: v.optional(
      v.array(
        v.object({
          contentType: v.optional(v.string()),
          name: v.string(),
          storageId: v.id("_storage"),
        }),
      ),
    ),
    cashback: v.optional(v.number()),
    category: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    discount: v.optional(v.number()),
    installed: v.optional(v.boolean()),
    mileage: v.optional(v.number()),
    modification: v.optional(v.boolean()),
    name: v.string(),
    price: v.number(),

    url: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_category", ["category"]),

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
