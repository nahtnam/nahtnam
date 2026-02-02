import { createEnv } from "@t3-oss/env-core";
import { REQUIRED_STRING } from "./utils";

export const clientEnv = createEnv({
  client: {
    VITE_TURNSTILE_SITE_KEY: REQUIRED_STRING,
  },
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
  runtimeEnv: import.meta.env,
});
