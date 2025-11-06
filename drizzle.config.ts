import { defineConfig } from "drizzle-kit";
import { env } from "@/config/env/server";

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    authToken: env.DATABASE_AUTH_TOKEN,
    url: env.DATABASE_URL,
  },
  dialect: "turso",
  migrations: {
    prefix: "timestamp",
  },
  out: "./src/db/migrations",
  schema: "./src/db/schema/index.ts",
});
