import { PostHog } from "posthog-node";
import { serverEnv } from "@/lib/config/server";

export const posthog = new PostHog(serverEnv.POSTHOG_API_KEY ?? "", {
  flushAt: 1,
  flushInterval: 0,
});
