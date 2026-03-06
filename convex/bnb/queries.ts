import { query } from "../_generated/server";

export const listBookings = query({
  args: {},
  async handler(ctx) {
    const accepted = await ctx.db
      .query("bnbBookings")
      .withIndex("by_status", (q) => q.eq("status", "accepted"))
      .collect();

    const pending = await ctx.db
      .query("bnbBookings")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return { accepted, pending };
  },
});
