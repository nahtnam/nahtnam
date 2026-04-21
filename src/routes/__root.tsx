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
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import {
  AuthKitProvider,
  useAccessToken,
  useAuth,
} from "@workos/authkit-tanstack-react-start/client";
import { useCallback, useMemo } from "react";
import appCss from "../styles.css?url";
import { Footer } from "./-components/footer";
import { Navbar } from "./-components/navbar";
import { NotFound } from "./-components/not-found";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { appName, appUrl } from "@/lib/config";

const defaultDescription =
  "Manthan (@nahtnam) - Principal Software Engineer at Mercury. Writing about software, startups, and personal finance.";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  async beforeLoad(ctx) {
    const auth = await getAuth();

    if (auth.user) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(auth.accessToken);
      ctx.context.convexQueryClient.convexClient.setAuth(
        async () => auth.accessToken ?? null,
      );
    } else {
      ctx.context.convexQueryClient.convexClient.clearAuth();
    }

    return {
      auth,
    };
  },
  component: RootComponent,
  head: () => ({
    links: [
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
        content: appName,
        title: appName,
      },
      {
        content: defaultDescription,
        name: "description",
      },
      {
        content: appName,
        property: "og:site_name",
      },
      {
        content: appUrl,
        property: "og:url",
      },
      {
        content: "website",
        property: "og:type",
      },
      {
        content: appName,
        property: "og:title",
      },
      {
        content: defaultDescription,
        property: "og:description",
      },
      {
        content: `${appUrl}/assets/images/me.avif`,
        property: "og:image",
      },
      {
        content: "summary_large_image",
        name: "twitter:card",
      },
      {
        content: "@nahtnam",
        name: "twitter:creator",
      },
      {
        content: "@nahtnam",
        name: "twitter:site",
      },
      {
        content: `${appUrl}/assets/images/me.avif`,
        name: "twitter:image",
      },
      {
        content: "light",
        name: "color-scheme",
      },
      {
        content: "light",
        name: "supported-color-schemes",
      },
    ],
  }),
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
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const context = useRouteContext({ from: "__root__" });

  return (
    <AuthKitProvider initialAuth={context.auth}>
      <ConvexProviderWithAuth
        client={context.convexQueryClient.convexClient}
        useAuth={useAuthFromAuthKit}
      >
        <TooltipProvider>
          <div className="relative flex min-h-full flex-col">
            <Navbar />
            <main className="grow print:m-0 print:grow-0">
              <Outlet />
            </main>
            <Footer />
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
