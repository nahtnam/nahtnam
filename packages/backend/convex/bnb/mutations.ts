import { v } from "convex/values";

import { convex } from "../fluent";
import { hasActiveBnbSession, unauthorizedBnbSession } from "./auth";

export const createBooking = convex
  .mutation()
  .input({
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.array(v.string()),
    notes: v.optional(v.string()),
    now: v.number(),
    sessionTokenHash: v.string(),
  })
  .handler(async (ctx, args) => {
    if (
      !(await hasActiveBnbSession({
        ctx,
        now: args.now,
        tokenHash: args.sessionTokenHash,
      }))
    ) {
      unauthorizedBnbSession();
    }

    return ctx.db.insert("bnbBookings", {
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      guests: args.guests,
      notes: args.notes,
      status: "pending",
    });
  })
  .internal();
