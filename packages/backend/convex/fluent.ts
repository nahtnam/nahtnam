import { adminRole } from "@repo/config/auth";
import type { Auth, UserIdentity } from "convex/server";
import { ConvexError } from "convex/values";
import { createBuilder } from "fluent-convex";

import type { DataModel } from "./_generated/dataModel";

export const convex = createBuilder<DataModel>();

const authMiddleware = convex
  .$context<{ auth: Auth }>()
  .createMiddleware(async (ctx, next) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      });
    }

    return next({
      ...ctx,
      identity,
    });
  });

export const authedQuery = convex.query().use(authMiddleware);
export const authedMutation = convex.mutation().use(authMiddleware);
export const authedAction = convex.action().use(authMiddleware);

export function isAdminIdentity(identity: UserIdentity) {
  return (
    identity.role === adminRole ||
    (Array.isArray(identity.roles) && identity.roles.includes(adminRole))
  );
}

const adminMiddleware = convex
  .$context<{ auth: Auth; identity: UserIdentity }>()
  .createMiddleware((ctx, next) => {
    if (!isAdminIdentity(ctx.identity)) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Administrator access required",
      });
    }

    return next(ctx);
  });

export const adminQuery = authedQuery.use(adminMiddleware);
export const adminMutation = authedMutation.use(adminMiddleware);
export const adminAction = authedAction.use(adminMiddleware);
