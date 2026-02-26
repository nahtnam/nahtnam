import { createEnv } from "@t3-oss/env-core";
import { REQUIRED_STRING, REQUIRED_URL } from "./utils";

export const clientEnv = createEnv({
  client: {
    VITE_CONVEX_SITE_URL: REQUIRED_URL,
    VITE_CONVEX_URL: REQUIRED_URL,
    VITE_TURNSTILE_SITE_KEY: REQUIRED_STRING,
  },
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
  runtimeEnv: import.meta.env,
});
