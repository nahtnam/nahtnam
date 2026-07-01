import process from "node:process";
import { createEnv } from "@t3-oss/env-core";
import {
  OPTIONAL_NUMBER,
  OPTIONAL_STRING,
  REQUIRED_STRING,
  REQUIRED_URL,
} from "../../../src/lib/config/utils";

export const workerEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    CONVEX_URL: REQUIRED_URL,
    PRINTER_HOST: REQUIRED_STRING,
    PRINTER_PORT: OPTIONAL_NUMBER,
    PRINT_SECRET: REQUIRED_STRING,
    PRINT_WORKER_ID: OPTIONAL_STRING,
  },
});
