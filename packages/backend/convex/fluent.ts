import type { Auth } from "convex/server";
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
