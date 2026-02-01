import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/sign-out")({
  server: {
    handlers: {
      GET: async () => {
        await auth.api.signOut({
          headers: await getRequestHeaders(),
        });
        return redirect({ to: "/" });
      },
    },
  },
});
