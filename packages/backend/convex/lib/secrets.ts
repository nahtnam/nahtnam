import { ConvexError } from "convex/values";

import { featureEnv } from "./env";

export function requireBnbPassword(password: string) {
  if (!featureEnv.BNB_PASSWORD || password !== featureEnv.BNB_PASSWORD) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Wrong password" });
  }
}

export function requirePrintSecret(secret: string) {
  if (!featureEnv.PRINT_SECRET || secret !== featureEnv.PRINT_SECRET) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }
}
