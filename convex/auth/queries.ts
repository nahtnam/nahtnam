import { query } from "../_generated/server";
import { authComponent } from "../auth";

export const safeGetCurrentUser = query({
  args: {},
  async handler(ctx) {
    return authComponent.safeGetAuthUser(ctx);
  },
});

export const getCurrentUser = query({
  args: {},
  async handler(ctx) {
    return authComponent.getAuthUser(ctx);
  },
});
