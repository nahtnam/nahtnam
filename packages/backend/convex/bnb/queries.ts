import type { FunctionReference } from "convex/server";
import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import { convex } from "../fluent";
import {
  assertValidBnbSessionToken,
  hashBnbSessionToken,
  hasActiveBnbSession,
  unauthorizedBnbSession,
} from "./auth";

type ListBookingsResult = {
  accepted: Doc<"bnbBookings">[];
  pending: Doc<"bnbBookings">[];
};

export const listBookingsInternal = convex
  .query()
  .input({ now: v.number(), tokenHash: v.string() })
  .handler(async (ctx, args) => {
    if (
      !(await hasActiveBnbSession({
        ctx,
        now: args.now,
        tokenHash: args.tokenHash,
      }))
    ) {
      unauthorizedBnbSession();
    }

    const [accepted, pending] = await Promise.all([
      ctx.db
        .query("bnbBookings")
        .withIndex("by_status", (query) => query.eq("status", "accepted"))
        .take(200),
      ctx.db
        .query("bnbBookings")
        .withIndex("by_status", (query) => query.eq("status", "pending"))
        .take(200),
    ]);

    return { accepted, pending };
  })
  .internal();

const listBookingsReference = makeFunctionReference(
  "bnb/queries:listBookingsInternal"
) as unknown as FunctionReference<
  "query",
  "internal",
  { now: number; tokenHash: string },
  ListBookingsResult
>;

export const listBookings = convex
  .action()
  .input({ sessionToken: v.string() })
  .handler(async (ctx, args) => {
    assertValidBnbSessionToken(args.sessionToken);
    const tokenHash = await hashBnbSessionToken(args.sessionToken);

    return ctx.runQuery(listBookingsReference, {
      now: Date.now(),
      tokenHash,
    });
  })
  .public();
