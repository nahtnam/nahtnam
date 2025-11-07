import { defineConfig } from "drizzle-kit";

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    authToken: "",
    url: "",
  },
  dialect: "turso",
  migrations: {
    prefix: "timestamp",
  },
  out: "./src/db/migrations",
  schema: "./src/db/schema/index.ts",
});
