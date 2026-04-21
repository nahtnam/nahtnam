import { createEnv } from "@t3-oss/env-core";
import { REQUIRED_STRING } from "./utils";

export const convexEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env, // eslint-disable-line n/prefer-global/process
  server: {
    ADMIN_EMAILS: REQUIRED_STRING,
    BNB_PASSWORD: REQUIRED_STRING,
    TELEGRAM_BOT_TOKEN: REQUIRED_STRING,
    TELEGRAM_CHAT_ID: REQUIRED_STRING,
    TURNSTILE_SECRET_KEY: REQUIRED_STRING,
    WORKOS_CLIENT_ID: REQUIRED_STRING,
  },
});
