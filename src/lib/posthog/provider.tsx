import type { PostHogConfig } from "posthog-js";
import { PostHogProvider } from "@posthog/react";
import { isProduction, appName } from "@/lib/config";
import { clientEnv } from "@/lib/config/client";

type PostHogAppProviderProps = {
  readonly children: React.ReactNode;
};

const postHogOptions = {
  capture_exceptions: true,
  defaults: "2026-01-30",
  logs: {
    captureConsoleLogs: false,
    environment: isProduction ? "production" : "development",
    serviceName: `${appName}-web`,
  },
  session_recording: {
    maskAllInputs: true,
  },
} satisfies Partial<PostHogConfig>;

export function PostHogAppProvider(
  props: PostHogAppProviderProps,
): React.ReactNode {
  const { children } = props;

  if (!clientEnv.VITE_POSTHOG_KEY) {
    return children;
  }

  return (
    <PostHogProvider
      apiKey={clientEnv.VITE_POSTHOG_KEY}
      options={postHogOptions}
    >
      {children}
    </PostHogProvider>
  );
}
