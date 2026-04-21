import { createEnv } from "@t3-oss/env-core";
import z from "zod";
import { REQUIRED_STRING } from "./utils";

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env, // eslint-disable-line n/prefer-global/process
  server: {
    WORKOS_API_KEY: REQUIRED_STRING,
    WORKOS_CLIENT_ID: REQUIRED_STRING,
    WORKOS_COOKIE_PASSWORD: z.string().min(32),
  },
});
