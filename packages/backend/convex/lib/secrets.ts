import { ConvexError } from "convex/values";

import { featureEnv } from "./env";

export function requirePrintSecret(secret: string) {
  if (!featureEnv.PRINT_SECRET || secret !== featureEnv.PRINT_SECRET) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }
}
