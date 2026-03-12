import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireAdmin } from "../lib/builder";

export const isAuthorized = query({
  args: { adminSecret: v.string() },
  handler(_, { adminSecret }) {
    requireAdmin(adminSecret);
    return true;
  },
});
