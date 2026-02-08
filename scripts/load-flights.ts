import { readFileSync } from "node:fs";
import { drizzle } from "drizzle-orm/libsql";
import { travelFlights } from "@/db/schema/travel";

const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: bun run scripts/load-flights.ts ./path/to/flights.csv");
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const db = drizzle({
  casing: "snake_case",
  connection: {
    authToken: process.env.DATABASE_AUTH_TOKEN,
    url: DATABASE_URL,
  },
});

const csv = readFileSync(csvPath, "utf-8");
const lines = csv.trim().split("\n");
const rows = lines.slice(1).filter((row) => row.trim().length > 0);

let upserted = 0;

for (const row of rows) {
  const columns = row.split(",");
  const values = {
    aircraftType: columns[19] ?? "",
    airline: columns[1] ?? "",
    date: columns[0] ?? "",
    flightNumber: columns[2] ?? "",
    from: columns[3] ?? "",
    to: columns[4] ?? "",
  };

  await db
    .insert(travelFlights)
    .values(values)
    .onConflictDoUpdate({
      set: {
        aircraftType: values.aircraftType,
        airline: values.airline,
        to: values.to,
      },
      target: [
        travelFlights.date,
        travelFlights.flightNumber,
        travelFlights.from,
      ],
    });

  upserted++;
}

console.log(`Upserted ${upserted} flights`);
