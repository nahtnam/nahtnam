import { PostHog } from "@posthog/convex";
import type { Auth } from "convex/server";
import { components } from "./_generated/api";

type IdentifyContext = {
  auth: Auth;
};

async function identifyFromConvexAuth(ctx: IdentifyContext) {
  const { auth } = ctx;
  const identity = await auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  return {
    distinctId: identity.tokenIdentifier,
  };
}

export const posthog = new PostHog(components.posthog, {
  identify: identifyFromConvexAuth,
});
