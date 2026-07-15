import { serverEnv } from "@repo/config/env/server";
import { PostHog } from "posthog-node";

export async function captureServerException(
  error: unknown,
  properties: Record<string, unknown>
) {
  const postHogApiKey = serverEnv.POSTHOG_API_KEY ?? "";

  if (!postHogApiKey) {
    return;
  }

  const posthog = new PostHog(postHogApiKey, {
    flushAt: 1,
    flushInterval: 0,
  });

  try {
    await posthog.captureExceptionImmediate(error, undefined, properties);
  } finally {
    await posthog.shutdown();
  }
}
