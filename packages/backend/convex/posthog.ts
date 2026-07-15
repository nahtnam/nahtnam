import { PostHog } from "@posthog/convex";
import type { Auth } from "convex/server";

import { components } from "./_generated/api";
import { env } from "./_generated/server";

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
    distinctId: identity.subject,
  };
}

const apiKey = env.POSTHOG_API_KEY ?? "";

function discardPostHogEvent() {
  return null;
}

export const posthog = new PostHog(components.posthog, {
  apiKey,
  beforeSend: apiKey ? undefined : discardPostHogEvent,
  identify: identifyFromConvexAuth,
});
