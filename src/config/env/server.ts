import { createEnv } from "@t3-oss/env-core";
import { OPTIONAL_STRING, REQUIRED_URL } from "./utils";

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    DATABASE_AUTH_TOKEN: OPTIONAL_STRING,
    DATABASE_URL: REQUIRED_URL,
  },
});
