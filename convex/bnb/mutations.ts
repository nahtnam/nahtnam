import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const createBooking = internalMutation({
  args: {
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  async handler(ctx, args) {
    return ctx.db.insert("bnbBookings", {
      ...args,
      status: "pending",
    });
  },
});
