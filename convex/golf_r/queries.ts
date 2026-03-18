import { query } from "../_generated/server";

export const listItems = query({
  args: {},
  async handler(ctx) {
    const items = await ctx.db
      .query("golfRItems")
      .withIndex("by_date")
      .order("desc")
      .collect();

    return items.map(({ attachments: _attachments, ...item }) => item);
  },
});
