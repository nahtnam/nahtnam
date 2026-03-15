/* eslint-disable unicorn/filename-case */
import { internalMutation } from "../_generated/server";

const seedItems = [
  {
    category: "purchase",
    date: "2026-03-05",
    discount: 2100,
    name: "2026 Volkswagen Golf R",
    price: 52_334,
  },
  {
    category: "tax",
    date: "2026-03-05",
    name: "Sales Tax",
    price: 3899.72,
  },
  {
    category: "fee",
    date: "2026-03-05",
    name: "Document Processing",
    price: 85,
  },
  {
    category: "fee",
    date: "2026-03-05",
    name: "Electronic Vehicle Registration (CVR)",
    price: 37,
  },
  {
    category: "fee",
    date: "2026-03-05",
    name: "Vehicle License Fees",
    price: 327,
  },
  {
    category: "fee",
    date: "2026-03-05",
    name: "Registration/Transfer/Titling",
    price: 340,
  },
  {
    category: "fee",
    date: "2026-03-05",
    name: "California Tire Fee",
    price: 7,
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
