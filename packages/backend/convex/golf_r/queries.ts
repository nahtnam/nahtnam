import { convex } from "../fluent";

const losAngelesDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Los_Angeles",
  year: "numeric",
});

function getTodayInLosAngeles() {
  const parts = losAngelesDateFormatter.formatToParts(new Date());
  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;

  return `${year}-${month}-${day}`;
}

export const listItems = convex
  .query()
  .input({})
  .handler(async (ctx) => {
    const today = getTodayInLosAngeles();
    const items = await ctx.db
      .query("golfRItems")
      .withIndex("by_date", (query) => query.lte("date", today))
      .order("desc")
      .take(500);

    return items.map(({ attachments: _attachments, ...item }) => item);
  })
  .public();
