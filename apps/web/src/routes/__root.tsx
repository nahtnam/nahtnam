import type { ConvexQueryClient } from "@convex-dev/react-query";
import { DaisyUIProvider } from "@formadapter/daisyui";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import type {
  NoUserInfo,
  UserInfo,
} from "@workos/authkit-tanstack-react-start";
import {
  AuthKitProvider,
  useAccessToken,
  useAuth,
} from "@workos/authkit-tanstack-react-start/client";
import { ConvexProviderWithAuth } from "convex/react";
import { useCallback, useMemo } from "react";

import { PostHogIdentity } from "@/lib/posthog/identity";
import { PostHogAppProvider } from "@/lib/posthog/provider";

import { AnimatedIdentityProvider } from "./-components/animated-identity";
import { Footer } from "./-components/footer";
import { Navbar } from "./-components/navbar";
import { NotFound } from "./-components/not-found";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
  convexQueryClient: ConvexQueryClient;
  queryClient: QueryClient;
  serverAuthState: {
    fail: (error: unknown) => void;
    resolve: (auth: NoUserInfo | UserInfo) => void;
    wait: () => Promise<NoUserInfo | UserInfo>;
  };
}>()({
  async loader({ context }) {
    try {
      const auth = await getAuth();

      if (!auth.user) {
        context.serverAuthState.resolve(auth);
        return { auth };
      }

      const { accessToken, ...clientAuth } = auth;
      context.convexQueryClient.serverHttpClient?.setAuth(accessToken);
      context.serverAuthState.resolve(auth);

      return { auth: clientAuth };
    } catch (error) {
      context.serverAuthState.fail(error);
      throw error;
    }
  },
  component: RootComponent,
  head: () => ({
    links: [
      {
        crossOrigin: "anonymous",
        href: "https://font.ldcr.us",
        rel: "preconnect",
      },
      {
        as: "font",
        crossOrigin: "anonymous",
        href: "https://font.ldcr.us/v/0.0.1/fonts/LudicSans-LatinCore.woff2",
        rel: "preload",
        type: "font/woff2",
      },
      {
        href: "https://font.ldcr.us/ludic.css",
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
        content: "#fbfbfc",
        name: "theme-color",
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

type RootDocumentProps = {
  children: React.ReactNode;
};

function RootDocument(props: RootDocumentProps) {
  const { children } = props;

  return (
    <html lang="en" className="h-full" data-theme="route">
      <head>
        <HeadContent />
      </head>
      <body className="flex h-full flex-col antialiased">
        <DaisyUIProvider>
          <PostHogAppProvider>{children}</PostHogAppProvider>
        </DaisyUIProvider>
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "TanStack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { auth } = Route.useLoaderData();
  const { convexQueryClient } = Route.useRouteContext();
  const isChromeless = useRouterState({
    select: (state) => state.location.pathname.startsWith("/pomodoro"),
  });

  return (
    <AuthKitProvider initialAuth={auth}>
      <ConvexProviderWithAuth
        client={convexQueryClient.convexClient}
        // oxlint-disable-next-line react/react-compiler
        useAuth={useAuthFromAuthKit}
      >
        <AnimatedIdentityProvider>
          <PostHogIdentity />
          <a
            className="btn btn-primary fixed top-4 left-4 z-50 -translate-y-24 opacity-0 transition focus:translate-y-0 focus:opacity-100"
            href="#main-content"
          >
            Skip to content
          </a>
          {isChromeless ? null : <Navbar />}
          <main className="min-w-0 grow" id="main-content">
            <Outlet />
          </main>
          {isChromeless ? null : <Footer />}
        </AnimatedIdentityProvider>
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}

function useAuthFromAuthKit() {
  const { loading, user } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();

  // oxlint-disable-next-line react-doctor/react-compiler-no-manual-memoization
  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) {
        return null;
      }

      try {
        if (forceRefreshToken) {
          return (await refresh()) ?? null;
        }

        return (await getAccessToken()) ?? null;
      } catch {
        return null;
      }
    },
    [getAccessToken, refresh, user]
  );

  // oxlint-disable-next-line react-doctor/react-compiler-no-manual-memoization
  return useMemo(
    () => ({
      fetchAccessToken,
      isAuthenticated: Boolean(user),
      isLoading: loading,
    }),
    [fetchAccessToken, loading, user]
  );
}
