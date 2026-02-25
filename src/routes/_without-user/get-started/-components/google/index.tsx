import { Icon } from "@iconify-icon/react";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export function Google() {
  const signInWithGoogleMutation = useMutation({
    mutationFn: async () =>
      authClient.signIn.social({
        callbackURL: "/app",
        provider: "google",
      }),
  });

  return (
    <Button
      className="w-full"
      disabled={signInWithGoogleMutation.isPending}
      size="lg"
      type="button"
      variant="outline"
      onClick={() => {
        signInWithGoogleMutation.mutate();
      }}
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
