import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { LocalFormExample } from "./-components/local-form-example";

const withUserRoute = getRouteApi("/_with-user");

export const Route = createFileRoute("/_with-user/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = withUserRoute.useLoaderData();
  const name = user.firstName ?? user.email;

  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="heading text-4xl">Hello, {name}!</h1>
          <p className="muted">
            This protected page is ready for your application.
          </p>
        </header>
        <LocalFormExample />
      </div>
    </div>
  );
}
