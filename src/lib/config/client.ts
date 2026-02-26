import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const clientEnv = createEnv({
  client: {
    VITE_CONVEX_URL: z.url(),
    VITE_TURNSTILE_SITE_KEY: z.string().min(1),
  },
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
  runtimeEnv: import.meta.env,
});
