import { v } from "convex/values";

import { convex } from "../fluent";
import { requireBnbPassword } from "../lib/secrets";

export const listBookings = convex
  .query()
  .input({ password: v.string() })
  .handler(async (ctx, args) => {
    requireBnbPassword(args.password);

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
  .public();
