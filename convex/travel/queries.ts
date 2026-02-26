import { query } from "../_generated/server";
import { computeStats } from "./computeStats";

export const getStats = query({
  args: {},
  async handler(ctx) {
    const rows = await ctx.db
      .query("travelFlights")
      .withIndex("by_date")
      .order("desc")
      .collect();

    const flights = rows.map((row) => ({
      aircraftType: row.aircraftType,
      airline: row.airline,
      date: row.date,
      flightNumber: row.flightNumber,
      from: row.from,
      to: row.to,
    }));

    return computeStats(flights);
  },
});
