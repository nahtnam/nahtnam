import type { EnvDefinition } from "convex/server";
import { v } from "convex/values";

export const convexEnv = {
  POSTHOG_API_KEY: v.optional(v.string()),
  WORKOS_API_KEY: v.string(),
  WORKOS_CLIENT_ID: v.string(),
} satisfies EnvDefinition;
