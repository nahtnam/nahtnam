import { os } from "@orpc/server";
import { db } from "@/db";
import { computeStats } from "@/routes/travel/-lib/compute-stats";

export const getStats = os.handler(async () => {
  const rows = await db.query.travelFlights.findMany({
    orderBy: {
      date: "desc",
    },
  });

  const flights = rows.map((row) => ({
    aircraftType: row.aircraftType,
    airline: row.airline,
    date: row.date,
    flightNumber: row.flightNumber,
    from: row.from,
    to: row.to,
  }));

  return computeStats(flights);
});
