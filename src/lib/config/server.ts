import { createEnv } from "@t3-oss/env-core";
import { REQUIRED_STRING } from "./utils";

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env, // eslint-disable-line n/prefer-global/process
  server: {
    ADMIN_SECRET: REQUIRED_STRING,
  },
});
