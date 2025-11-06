import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/config/env/server";
import { relations } from "@/db/relations";

// biome-ignore lint/performance/noNamespaceImport: drizzle
import * as schema from "@/db/schema";

// biome-ignore lint/performance/noBarrelFile: schema
export * as schema from "@/db/schema";

export const db = drizzle(env.DATABASE_URL, {
  casing: "snake_case",
  relations,
  schema,
});
