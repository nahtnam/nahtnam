import { query } from "../_generated/server";
import { requireAdmin } from "../lib/builder";

export const isAuthorized = query({
  args: {},
  async handler(ctx) {
    await requireAdmin(ctx);
    return true;
  },
});
