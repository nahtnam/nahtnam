import { createEnv } from "@t3-oss/env-core";

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {},
});
