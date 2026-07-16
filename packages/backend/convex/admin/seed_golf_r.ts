import { convex } from "../fluent";

const SEED_DATE = "2026-03-05";

const seedItems = [
  {
    category: "purchase",
    date: SEED_DATE,
    discount: 2100,
    name: "2026 Volkswagen Golf R",
    price: 52_334,
  },
  {
    category: "tax",
    date: SEED_DATE,
    name: "Sales Tax",
    price: 3899.72,
  },
  {
    category: "fee",
    date: SEED_DATE,
    name: "Document Processing",
    price: 85,
  },
  {
    category: "fee",
    date: SEED_DATE,
    name: "Electronic Vehicle Registration (CVR)",
    price: 37,
  },
  {
    category: "fee",
    date: SEED_DATE,
    name: "Vehicle License Fees",
    price: 327,
  },
  {
    category: "fee",
    date: SEED_DATE,
    name: "Registration/Transfer/Titling",
    price: 340,
  },
  {
    category: "fee",
    date: SEED_DATE,
    name: "California Tire Fee",
    price: 7,
  },
] as const;

export const removeSortOrder = convex
  .mutation()
  .input({})
  .handler(async (ctx) => {
    const items = await ctx.db.query("golfRItems").take(500);

    await Promise.all(
      items.map((item) => {
        const data = { ...item } as Record<string, unknown>;
        Reflect.deleteProperty(data, "_creationTime");
        Reflect.deleteProperty(data, "_id");
        Reflect.deleteProperty(data, "sortOrder");
        return ctx.db.replace("golfRItems", item._id, data as never);
      })
    );
  })
  .internal();

export const seed = convex
  .mutation()
  .input({})
  .handler(async (ctx) => {
    const existing = await ctx.db.query("golfRItems").take(500);

    await Promise.all(
      seedItems.map((item) => {
        const match = existing.find(
          (entry) =>
            entry.name === item.name && entry.category === item.category
        );

        return match
          ? ctx.db.patch("golfRItems", match._id, item)
          : ctx.db.insert("golfRItems", item);
      })
    );
  })
  .internal();
