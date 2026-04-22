import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { convexEnv } from "./config/env";

type AdminCtx = ActionCtx | MutationCtx | QueryCtx;

const adminEmails = new Set(
  convexEnv.ADMIN_EMAILS.split(",").map((email) => email.trim().toLowerCase()),
);

export async function requireAdmin(ctx: AdminCtx) {
  const identity = await ctx.auth.getUserIdentity();
  const email = identity?.email?.toLowerCase();

  if (!identity) {
    throw new Error("Unauthorized");
  }

  if (!email) {
    throw new Error(
      "Unauthorized: authenticated token is missing an email claim",
    );
  }

  if (!adminEmails.has(email)) {
    throw new Error("Unauthorized");
  }

  return identity;
}
