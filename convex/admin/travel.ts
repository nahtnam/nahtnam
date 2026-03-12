import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireAdmin } from "../lib/builder";

export const upsertFlights = mutation({
  args: {
    adminSecret: v.string(),
    flights: v.array(
      v.object({
        aircraftType: v.string(),
        airline: v.string(),
        date: v.string(),
        flightNumber: v.string(),
        flightyId: v.string(),
        from: v.string(),
        to: v.string(),
      }),
    ),
  },
  async handler(ctx, { adminSecret, flights }) {
    requireAdmin(adminSecret);
    let created = 0;
    let updated = 0;

    for (const flight of flights) {
      const existing = await ctx.db
        .query("travelFlights")
        .withIndex("by_flightyId", (q) => q.eq("flightyId", flight.flightyId))
        .first();

      if (existing) {
        await ctx.db.patch("travelFlights", existing._id, flight);
        updated++;
      } else {
        await ctx.db.insert("travelFlights", flight);
        created++;
      }
    }

    return { created, updated };
  },
});
