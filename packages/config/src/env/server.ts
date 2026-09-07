import { createEnv } from "@t3-oss/env-core";
import { httpUrl, string } from "zod";

const requiredString = string().trim().min(1);
const optionalString = requiredString.optional();

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    AI_AUTOMATION_SECRET: optionalString,
    POSTHOG_API_KEY: optionalString,
    PRINT_SECRET: optionalString,
    TWILIO_ACCOUNT_SID: optionalString,
    TWILIO_AUTH_TOKEN: optionalString,
    WORKOS_API_KEY: requiredString,
    WORKOS_CLIENT_ID: requiredString,
    WORKOS_COOKIE_PASSWORD: string().min(32),
    WORKOS_REDIRECT_URI: httpUrl(),
  },
});
