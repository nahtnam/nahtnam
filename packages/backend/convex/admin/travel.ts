import { ConvexError, v } from "convex/values";

import { adminMutation } from "../fluent";

export const upsertFlights = adminMutation
  .input({
    flights: v.array(
      v.object({
        aircraftType: v.string(),
        airline: v.string(),
        date: v.string(),
        flightNumber: v.string(),
        flightyId: v.string(),
        from: v.string(),
        to: v.string(),
      })
    ),
  })
  .handler(async (ctx, args) => {
    if (args.flights.length > 100) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: "Import at most 100 flights per batch",
      });
    }

    const flightyIds = args.flights.map(({ flightyId }) => flightyId);

    if (new Set(flightyIds).size !== flightyIds.length) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: "A batch cannot contain duplicate Flighty IDs",
      });
    }

    const results = await Promise.all(
      args.flights.map(async (flight) => {
        const existing = await ctx.db
          .query("travelFlights")
          .withIndex("by_flightyId", (query) =>
            query.eq("flightyId", flight.flightyId)
          )
          .first();

        if (existing) {
          await ctx.db.patch("travelFlights", existing._id, flight);
          return "updated" as const;
        }

        await ctx.db.insert("travelFlights", flight);
        return "created" as const;
      })
    );

    return {
      created: results.filter((result) => result === "created").length,
      updated: results.filter((result) => result === "updated").length,
    };
  })
  .public();
