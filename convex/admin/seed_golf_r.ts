/* eslint-disable unicorn/filename-case */
import { internalMutation } from "../_generated/server";

const seedItems = [
  {
    category: "purchase",
    date: "2026-03-05",
    discount: 2100,
    name: "2026 Volkswagen Golf R",
    price: 52_334,
    sortOrder: 0,
  },
  {
    category: "tax",
    date: "2026-03-05",
    name: "Sales Tax",
    price: 3899.72,
    sortOrder: 1,
  },
  {
    category: "fee",
    date: "2026-03-05",
    name: "Document Processing",
    price: 85,
    sortOrder: 2,
  },
  {
    category: "fee",
    date: "2026-03-05",
    name: "Electronic Vehicle Registration (CVR)",
    price: 37,
    sortOrder: 3,
  },
  {
    category: "fee",
    date: "2026-03-05",
    name: "Vehicle License Fees",
    price: 327,
    sortOrder: 4,
  },
  {
    category: "fee",
    date: "2026-03-05",
    name: "Registration/Transfer/Titling",
    price: 340,
    sortOrder: 5,
  },
  {
    category: "fee",
    date: "2026-03-05",
    name: "California Tire Fee",
    price: 7,
    sortOrder: 6,
  },
];

export const seed = internalMutation({
  args: {},
  async handler(ctx) {
    const existing = await ctx.db.query("golfRItems").collect();

    for (const item of seedItems) {
      const match = existing.find(
        (entry) => entry.name === item.name && entry.category === item.category,
      );

      await (match
        ? ctx.db.patch("golfRItems", match._id, item)
        : ctx.db.insert("golfRItems", item));
    }
  },
});
