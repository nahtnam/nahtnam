import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import posthog from "posthog-js";
import { useEffect } from "react";
import { clientEnv } from "@/lib/config/client";

export function PostHogIdentity() {
  const { loading, organizationId, user } = useAuth();
  const email = user?.email;
  const firstName = user?.firstName;
  const lastName = user?.lastName;
  const name = [firstName, lastName].filter(Boolean).join(" ") || undefined;
  const userId = user?.id;

  useEffect(() => {
    if (!clientEnv.VITE_POSTHOG_KEY) {
      return;
    }

    if (loading) {
      return;
    }

    if (!userId) {
      posthog.reset();
      return;
    }

    posthog.identify(userId, {
      email,
      name,
      organizationId,
    });
  }, [email, loading, name, organizationId, userId]);

  return null;
}
