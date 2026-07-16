import type { EnvDefinition } from "convex/server";
import { v } from "convex/values";

export const convexEnv = {
  BNB_PASSWORD: v.string(),
  POSTHOG_API_KEY: v.optional(v.string()),
  PRINT_SECRET: v.optional(v.string()),
  TELEGRAM_BOT_TOKEN: v.string(),
  TELEGRAM_CHAT_ID: v.string(),
  TURNSTILE_SECRET_KEY: v.string(),
  WORKOS_CLIENT_ID: v.string(),
} satisfies EnvDefinition;
