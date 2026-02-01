import { Icon } from "@iconify-icon/react";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/routes/-shadcn/components/ui/button";
import { Spinner } from "@/routes/-shadcn/components/ui/spinner";

export function Google() {
  const signInWithGoogleMutation = useMutation({
    mutationFn: () =>
      authClient().signIn.social({
        callbackURL: "/app",
        provider: "google",
      }),
  });

  return (
    <Button
      className="w-full"
      disabled={signInWithGoogleMutation.isPending}
      onClick={() => {
        signInWithGoogleMutation.mutateAsync();
      }}
      size="lg"
      type="button"
      variant="outline"
    >
      {signInWithGoogleMutation.isPending ? (
        <Spinner />
      ) : (
        <Icon icon="logos:google-icon" />
      )}
      Login with Google
    </Button>
  );
}
