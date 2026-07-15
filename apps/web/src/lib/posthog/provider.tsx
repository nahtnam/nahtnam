import { PostHogProvider } from "@posthog/react";
import { appName, isProduction } from "@repo/config/app";
import { clientEnv } from "@repo/config/env/client";
import type { PostHogConfig } from "posthog-js";
import { useState } from "react";

import { PostHogReadyContext } from "./context";

type PostHogAppProviderProps = {
  children: React.ReactNode;
};

const postHogOptions = {
  capture_exceptions: true,
  defaults: "2026-05-30",
  logs: {
    captureConsoleLogs: false,
    environment: isProduction ? "production" : "development",
    serviceName: `${appName}-web`,
  },
  session_recording: {
    maskAllInputs: true,
  },
} satisfies Partial<PostHogConfig>;

const postHogApiKey = clientEnv.VITE_POSTHOG_KEY ?? "";

export function PostHogAppProvider(
  props: PostHogAppProviderProps
): React.ReactNode {
  const { children } = props;
  const [isReady, setIsReady] = useState(false);

  if (!postHogApiKey) {
    return children;
  }

  const options = {
    ...postHogOptions,
    loaded: () => setIsReady(true),
  } satisfies Partial<PostHogConfig>;

  return (
    <PostHogProvider apiKey={postHogApiKey} options={options}>
      <PostHogReadyContext.Provider value={isReady}>
        {children}
      </PostHogReadyContext.Provider>
    </PostHogProvider>
  );
}
