import { integer } from "drizzle-orm/sqlite-core";

export const shared = {
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  id: integer().primaryKey({ autoIncrement: true }),
  updatedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
};
