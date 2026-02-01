import { createFileRoute } from "@tanstack/react-router";
import { H1 } from "../../-shadcn/components/ui/typography";

export const Route = createFileRoute("/_with-user/app/")({
  component: RouteComponent,
  loader({ context }) {
    const { user } = context;

    return {
      user,
    };
  },
});

function RouteComponent() {
  const { user } = Route.useLoaderData();

  return (
    <div className="container mx-auto my-8">
      <H1>Hello {user.name}!</H1>
    </div>
  );
}
