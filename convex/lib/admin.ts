import { convexEnv } from "./config/env";

export function requireAdmin(adminSecret: string) {
  if (adminSecret !== convexEnv.ADMIN_SECRET) {
    throw new Error("Unauthorized");
  }
}
