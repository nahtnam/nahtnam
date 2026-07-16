import { v } from "convex/values";

import { convex } from "../fluent";

export const createBooking = convex
  .mutation()
  .input({
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.array(v.string()),
    notes: v.optional(v.string()),
  })
  .handler((ctx, args) =>
    ctx.db.insert("bnbBookings", { ...args, status: "pending" })
  )
  .internal();
