import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from "@tanstack/react-router";
import { type QueryClient } from "@tanstack/react-query";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createServerFn } from "@tanstack/react-start";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import appCss from "../styles.css?url";
import { Navbar } from "./-components/navbar";
import { NotFound } from "./-components/not-found";
import { Footer } from "./-components/footer";
import { getToken } from "@/lib/auth-server";
import { authClient } from "@/lib/auth-client";
import { appName } from "@/lib/config";

const getAuth = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await getToken();
  } catch (error) {
    console.error("getAuth error:", error);
    return null;
  }
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  async beforeLoad(ctx) {
    const token = await getAuth();
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return {
      isAuthenticated: Boolean(token),
      token,
    };
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
        charSet: "utf8",
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
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body className="flex h-full flex-col antialiased">
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const context = useRouteContext({ from: Route.id });
  return (
    <ConvexBetterAuthProvider
      client={context.convexQueryClient.convexClient}
      authClient={authClient}
      initialToken={context.token}
    >
      <Navbar />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </ConvexBetterAuthProvider>
  );
}
