import { createEnv } from "@t3-oss/env-core";

export const clientEnv = createEnv({
  client: {
    // VITE_...
  },
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
});
