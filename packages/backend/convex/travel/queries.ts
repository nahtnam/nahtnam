import { convex } from "../fluent";
import { computeStats } from "./computeStats";

export const getStats = convex
  .query()
  .input({})
  .handler(async (ctx) => {
    const rows = await ctx.db
      .query("travelFlights")
      .withIndex("by_date")
      .order("desc")
      .take(2000);
    const flights = rows.map((row) => ({
      aircraftType: row.aircraftType,
      airline: row.airline,
      date: row.date,
      flightNumber: row.flightNumber,
      from: row.from,
      to: row.to,
    }));

    return computeStats({ flights });
  })
  .public();
