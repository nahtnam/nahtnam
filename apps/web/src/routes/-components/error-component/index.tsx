import { usePostHog } from "@posthog/react";
import { clientEnv } from "@repo/config/env/client";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { use, useEffect, useRef } from "react";

import { PostHogReadyContext } from "@/lib/posthog/context";

export function ErrorComponent(props: ErrorComponentProps) {
  const { error, reset } = props;
  const isPostHogReady = use(PostHogReadyContext);
  const lastCapturedError = useRef<unknown>(null);
  const posthog = usePostHog();
  const router = useRouter();

  useEffect(() => {
    if (
      !clientEnv.VITE_POSTHOG_KEY ||
      !isPostHogReady ||
      lastCapturedError.current === error
    ) {
      return;
    }

    lastCapturedError.current = error;
    posthog.captureException(error);
  }, [error, isPostHogReady, posthog]);

  const handleRetry = () => {
    reset();
    void router.invalidate();
  };

  return (
    <div className="hero min-h-64">
      <div className="hero-content text-center">
        <div className="max-w-md space-y-4">
          <div role="alert">
            <h1 className="heading text-4xl">Something went wrong</h1>
            <p className="muted mt-2 text-lg">
              We couldn&apos;t load this page. Please try again.
            </p>
          </div>
          <button className="btn" onClick={handleRetry} type="button">
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
