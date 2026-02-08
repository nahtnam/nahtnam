import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { shared } from "./utils/base";

export const travelFlights = sqliteTable(
  "travel_flights",
  {
    ...shared,
    aircraftType: text().notNull(),
    airline: text().notNull(),
    date: text().notNull(),
    flightNumber: text().notNull(),
    from: text().notNull(),
    to: text().notNull(),
  },
  (t) => [unique().on(t.date, t.flightNumber, t.from)]
);
