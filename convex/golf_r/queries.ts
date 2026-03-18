import { query } from "../_generated/server";

function getTodayInLosAngeles() {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Los_Angeles",
    year: "numeric",
  }).formatToParts(new Date());

  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;

  return `${year}-${month}-${day}`;
}

export const listItems = query({
  args: {},
  async handler(ctx) {
    const today = getTodayInLosAngeles();
    const items = await ctx.db
      .query("golfRItems")
      .withIndex("by_date")
      .order("desc")
      .collect();

    return items
      .filter((item) => item.date <= today)
      .map(({ attachments: _attachments, ...item }) => item);
  },
});
