import { createEnv } from "@t3-oss/env-core";
import { httpUrl, string } from "zod";

const optionalString = string().trim().min(1).optional();

export const clientEnv = createEnv({
  client: {
    VITE_CONVEX_URL: httpUrl(),
    VITE_POSTHOG_KEY: optionalString,
  },
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
  runtimeEnv: import.meta.env,
});
