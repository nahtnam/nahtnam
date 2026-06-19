import type { ConvexQueryClient } from "@convex-dev/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ConvexProviderWithAuth } from "convex/react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouteContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import {
  AuthKitProvider,
  useAccessToken,
  useAuth,
} from "@workos/authkit-tanstack-react-start/client";
import { useCallback, useMemo } from "react";
import reactTweetCss from "react-tweet/theme.css?url";
import appCss from "../styles.css?url";
import { Footer } from "./-components/footer";
import { Navbar } from "./-components/navbar";
import { NotFound } from "./-components/not-found";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PostHogIdentity } from "@/lib/posthog/identity";
import { PostHogAppProvider } from "@/lib/posthog/provider";
import { createSeo, pageSeo } from "@/lib/seo";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  async beforeLoad(ctx) {
    const auth = await getAuth();

    if (!auth.user) {
      return {
        auth,
      };
    }

    const { accessToken, ...clientAuth } = auth;
    ctx.context.convexQueryClient.serverHttpClient?.setAuth(accessToken);

    return {
      auth: clientAuth,
    };
  },
  component: RootComponent,
  head() {
    const seo = createSeo(pageSeo.home);

    return {
      links: [
        {
          href: reactTweetCss,
          rel: "stylesheet",
        },
        {
          href: appCss,
          rel: "stylesheet",
        },
        {
          href: "/assets/images/me.avif",
          rel: "icon",
          type: "image/avif",
        },
        {
          href: "/assets/images/me.avif",
          rel: "apple-touch-icon",
        },
        ...seo.links,
      ],
      meta: [
        {
          charSet: "utf8",
        },
        {
          content: "width=device-width, initial-scale=1",
          name: "viewport",
        },
        ...seo.meta,
        {
          content: "light",
          name: "color-scheme",
        },
        {
          content: "light",
          name: "supported-color-schemes",
        },
      ],
    };
  },
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  return (
    <html className="h-full" lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex h-full flex-col antialiased">
        <PostHogAppProvider>{children}</PostHogAppProvider>

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
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const context = useRouteContext({ from: "__root__" });
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isChromelessRoute =
    pathname === "/pomodoro" || pathname === "/pomodoro/";

  return (
    <AuthKitProvider initialAuth={context.auth}>
      <ConvexProviderWithAuth
        client={context.convexQueryClient.convexClient}
        useAuth={useAuthFromAuthKit}
      >
        <PostHogIdentity />
        <TooltipProvider>
          <div className="relative flex min-h-full flex-col">
            {isChromelessRoute ? null : <Navbar />}
            <main className="grow print:m-0 print:grow-0">
              <Outlet />
            </main>
            {isChromelessRoute ? null : <Footer />}
          </div>
        </TooltipProvider>
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}

function useAuthFromAuthKit() {
  const { loading, user } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) {
        return null;
      }

      if (forceRefreshToken) {
        return (await refresh()) ?? null;
      }

      return (await getAccessToken()) ?? null;
    },
    [getAccessToken, refresh, user],
  );

  return useMemo(
    () => ({
      fetchAccessToken,
      isAuthenticated: Boolean(user),
      isLoading: loading,
    }),
    [fetchAccessToken, loading, user],
  );
}
