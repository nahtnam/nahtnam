import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { appName } from "@/config/app";
import { authClient } from "@/lib/auth-client";
import appCss from "../styles.css?url";
import { Footer } from "./-components/footer";
import { Navbar } from "./-components/navbar";
import { NotFound } from "./-components/not-found";
import TanStackQueryDevtools from "./-components/tanstack-query/devtools";
import { Toaster } from "./-shadcn/components/ui/sonner";

type MyRouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context }) => {
    const sessionResponse = await context.queryClient.fetchQuery({
      queryFn: () => authClient().getSession(),
      queryKey: ["authClient", "getSession"],
    });
    if (sessionResponse.error) {
      return {
        session: null,
        user: null,
      };
    }

    if (!sessionResponse.data) {
      return {
        session: null,
        user: null,
      };
    }

    const { session, user } = sessionResponse.data;
    return { session, user };
  },
  component: RootComponent,
  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: appName,
      },
    ],
  }),
  loader: ({ context }) => ({
    user: context.user,
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html className="h-full" lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex h-full flex-col antialiased">
        {children}

        <Toaster />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { user } = Route.useLoaderData();

  return (
    <>
      <Navbar user={user} />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
