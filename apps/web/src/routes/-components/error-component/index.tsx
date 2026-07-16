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
    <>
      <title>Something Went Wrong | Manthan (@nahtnam)</title>
      <meta content="noindex, nofollow" name="robots" />
      <div className="page-shell page-shell-article grid min-h-[60vh] content-center">
        <section className="grid gap-8 border-y border-base-300 py-12 sm:grid-cols-[7rem_minmax(0,1fr)] sm:py-16">
          <span className="route-kicker pt-2">Error</span>
          <div className="max-w-xl">
            <div role="alert">
              <h1 className="heading text-5xl sm:text-6xl">
                Something went wrong
              </h1>
              <p className="muted mt-4 text-lg leading-8">
                We couldn&apos;t load this page. Please try again.
              </p>
            </div>
            <button
              className="btn btn-primary mt-8"
              onClick={handleRetry}
              type="button"
            >
              Try again
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
