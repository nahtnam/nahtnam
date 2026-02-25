import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env, // eslint-disable-line n/prefer-global/process
  server: {
    BETTER_AUTH_SECRET: z.string(),
    CONVEX_DEPLOYMENT: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    SITE_URL: z.url(),
  },
});
