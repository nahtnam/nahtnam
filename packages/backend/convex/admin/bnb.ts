import { v } from "convex/values";

import { adminMutation, adminQuery } from "../fluent";

export const listBookings = adminQuery
  .input({})
  .handler((ctx) => ctx.db.query("bnbBookings").order("desc").take(500))
  .public();

export const acceptBooking = adminMutation
  .input({ id: v.id("bnbBookings") })
  .handler(async (ctx, args) => {
    await ctx.db.patch("bnbBookings", args.id, { status: "accepted" });
    return null;
  })
  .public();

export const rejectBooking = adminMutation
  .input({ id: v.id("bnbBookings") })
  .handler(async (ctx, args) => {
    await ctx.db.patch("bnbBookings", args.id, { status: "rejected" });
    return null;
  })
  .public();
