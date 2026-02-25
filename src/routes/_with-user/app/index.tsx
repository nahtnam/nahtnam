import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { H1 } from "@/components/ui/typography";

export const Route = createFileRoute("/_with-user/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: user } = useSuspenseQuery(
    convexQuery(api.auth.queries.getCurrentUser),
  );

  return (
    <div className="container mx-auto my-8">
      <H1>Hello {user.name}!</H1>
    </div>
  );
}
