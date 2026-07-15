import { usePostHog } from "@posthog/react";
import { clientEnv } from "@repo/config/env/client";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { use, useEffect } from "react";

import { PostHogReadyContext } from "./context";

// oxlint-disable-next-line sonarjs/function-name
export function PostHogIdentity() {
  const { loading, organizationId, user } = useAuth();
  const isPostHogReady = use(PostHogReadyContext);
  const posthog = usePostHog();
  const email = user?.email;
  const firstName = user?.firstName;
  const lastName = user?.lastName;
  const name = [firstName, lastName].filter(Boolean).join(" ") || undefined;
  const userId = user?.id;

  useEffect(() => {
    if (!clientEnv.VITE_POSTHOG_KEY || !isPostHogReady) {
      return;
    }

    if (loading) {
      return;
    }

    if (!userId) {
      if (posthog.get_property("$user_id")) {
        posthog.reset();
      }

      return;
    }

    posthog.identify(userId, {
      email,
      name,
      organizationId,
    });
  }, [email, isPostHogReady, loading, name, organizationId, posthog, userId]);

  return null;
}
