/* eslint-disable unicorn/filename-case */
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/builder";

export const listItems = query({
  args: { adminSecret: v.string() },
  async handler(ctx, { adminSecret }) {
    requireAdmin(adminSecret);
    return ctx.db
      .query("golfRItems")
      .withIndex("by_date")
      .order("desc")
      .collect();
  },
});

export const createItem = mutation({
  args: {
    adminSecret: v.string(),
    cashback: v.optional(v.number()),
    category: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    discount: v.optional(v.number()),
    installed: v.optional(v.boolean()),
    mileage: v.optional(v.number()),
    name: v.string(),
    price: v.number(),

    url: v.optional(v.string()),
  },
  async handler(ctx, { adminSecret, ...args }) {
    requireAdmin(adminSecret);
    return ctx.db.insert("golfRItems", args);
  },
});

export const updateItem = mutation({
  args: {
    adminSecret: v.string(),
    cashback: v.optional(v.number()),
    category: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    discount: v.optional(v.number()),
    id: v.id("golfRItems"),
    installed: v.optional(v.boolean()),
    mileage: v.optional(v.number()),
    name: v.string(),
    price: v.number(),

    url: v.optional(v.string()),
  },
  async handler(ctx, { adminSecret, id, ...data }) {
    requireAdmin(adminSecret);
    await ctx.db.patch("golfRItems", id, data);
  },
});

export const deleteItem = mutation({
  args: { adminSecret: v.string(), id: v.id("golfRItems") },
  async handler(ctx, { adminSecret, id }) {
    requireAdmin(adminSecret);
    await ctx.db.delete("golfRItems", id);
  },
});
