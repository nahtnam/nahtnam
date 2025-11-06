/** biome-ignore-all lint/performance/noBarrelFile: schema */
export * from "./__generated__/auth-schema";

import { sqliteTable } from "drizzle-orm/sqlite-core";
import { shared } from "./shared";

export const test = sqliteTable("test", {
  ...shared,
});
