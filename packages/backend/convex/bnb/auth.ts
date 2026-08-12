import { ConvexError, v } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";
import { convex } from "../fluent";
import { featureEnv } from "../lib/env";

const BNB_AUTH_SCOPE = "global" as const;
const PASSWORD_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_PASSWORD_ATTEMPTS = 5;
export const BNB_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export const authorizeBnbSession = convex
  .mutation()
  .input({
    expiresAt: v.number(),
    password: v.string(),
    tokenHash: v.string(),
  })
  .handler(async (ctx, args) => {
    const now = Date.now();
    const attempt = await ctx.db
      .query("bnbAuthAttempts")
      .withIndex("by_scope", (query) => query.eq("scope", BNB_AUTH_SCOPE))
      .unique();

    const windowExpired =
      attempt !== null && now >= attempt.windowStartedAt + PASSWORD_WINDOW_MS;

    if (
      attempt !== null &&
      !windowExpired &&
      attempt.failedAttempts >= MAX_FAILED_PASSWORD_ATTEMPTS
    ) {
      return { status: "rate_limited" as const };
    }

    const passwordMatches =
      typeof featureEnv.BNB_PASSWORD === "string" &&
      featureEnv.BNB_PASSWORD.length > 0 &&
      args.password === featureEnv.BNB_PASSWORD;

    // A successful attempt must not consume or reset the failed-attempt budget.
    if (passwordMatches) {
      await ctx.db.insert("bnbSessions", {
        expiresAt: args.expiresAt,
        tokenHash: args.tokenHash,
      });
      return { status: "valid" as const };
    }

    if (attempt === null) {
      await ctx.db.insert("bnbAuthAttempts", {
        failedAttempts: 1,
        scope: BNB_AUTH_SCOPE,
        windowStartedAt: now,
      });
      return { status: "wrong" as const };
    }

    if (windowExpired) {
      await ctx.db.patch("bnbAuthAttempts", attempt._id, {
        failedAttempts: 1,
        windowStartedAt: now,
      });
      return { status: "wrong" as const };
    }

    await ctx.db.patch("bnbAuthAttempts", attempt._id, {
      failedAttempts: attempt.failedAttempts + 1,
    });
    return { status: "wrong" as const };
  })
  .internal();

export function assertValidBnbSessionToken(sessionToken: string) {
  if (!/^[\da-f]{64}$/u.test(sessionToken)) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }
}

export async function hashBnbSessionToken(sessionToken: string) {
  const bytes = new TextEncoder().encode(sessionToken);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(new Uint8Array(digest));
}

export function createBnbSessionToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

type HasActiveBnbSessionOptions = {
  ctx: MutationCtx | QueryCtx;
  now: number;
  tokenHash: string;
};

export async function hasActiveBnbSession(options: HasActiveBnbSessionOptions) {
  const { ctx, now, tokenHash } = options;
  const session = await ctx.db
    .query("bnbSessions")
    .withIndex("by_tokenHash", (query) => query.eq("tokenHash", tokenHash))
    .unique();
  return session !== null && session.expiresAt > now;
}

export function unauthorizedBnbSession(): never {
  throw new ConvexError({
    code: "UNAUTHORIZED",
    message: "Unauthorized",
  });
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}
