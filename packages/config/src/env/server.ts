import { createEnv } from "@t3-oss/env-core";
import { httpUrl, string } from "zod";

const optionalString = string().trim().min(1).optional();
const requiredString = string().trim().min(1);

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    POSTHOG_API_KEY: optionalString,
    WORKOS_API_KEY: requiredString,
    WORKOS_CLIENT_ID: requiredString,
    WORKOS_COOKIE_PASSWORD: string().min(32),
    WORKOS_REDIRECT_URI: httpUrl(),
  },
});
