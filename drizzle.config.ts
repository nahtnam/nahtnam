import { defineConfig } from "drizzle-kit";
import { serverEnv } from "@/config/env/server";

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    authToken: serverEnv.DATABASE_AUTH_TOKEN,
    url: serverEnv.DATABASE_URL,
  },
  dialect: "turso",
  migrations: {
    prefix: "timestamp",
  },
  out: "./src/db/migrations",
  schema: "./src/db/schema/index.ts",
});
