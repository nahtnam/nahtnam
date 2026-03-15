import { query } from "../_generated/server";

export const listItems = query({
  args: {},
  async handler(ctx) {
    return ctx.db
      .query("golfRItems")
      .withIndex("by_date")
      .order("asc")
      .collect();
  },
});
