import { createFileRoute, redirect } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { fetchAuthMutation } from "@/lib/auth-server";

export const Route = createFileRoute("/api/auth/sign-out")({
  server: {
    handlers: {
      async GET() {
        await fetchAuthMutation(api.auth.mutations.signOut);
        return redirect({ to: "/" });
      },
    },
  },
});
