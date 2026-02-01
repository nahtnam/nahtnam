import { drizzle } from "drizzle-orm/libsql";
import { serverEnv } from "@/config/env/server";
import { relations } from "@/db/relations";
// biome-ignore lint/performance/noNamespaceImport: drizzle
import * as schema from "@/db/schema";

// biome-ignore lint/performance/noBarrelFile: schema
export * as schema from "@/db/schema";

export const db = drizzle({
  casing: "snake_case",
  connection: {
    authToken: serverEnv.DATABASE_AUTH_TOKEN,
    url: serverEnv.DATABASE_URL,
  },
  relations,
  schema,
});
