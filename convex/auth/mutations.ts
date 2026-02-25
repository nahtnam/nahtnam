import { mutation } from "../_generated/server";
import { authComponent, createAuth } from "../auth";

export const signOut = mutation({
  args: {},
  async handler(ctx) {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.signOut({
      headers,
    });
  },
});
