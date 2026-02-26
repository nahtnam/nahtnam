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
import type { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider } from "convex/react";
import appCss from "../styles.css?url";
import { Navbar } from "./-components/navbar";
import { NotFound } from "./-components/not-found";
import { Footer } from "./-components/footer";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { appName, appUrl } from "@/lib/config";

const defaultDescription =
  "Manthan (@nahtnam) - Principal Software Engineer at Mercury. Writing about software, startups, and personal finance.";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}>()({
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
        content: defaultDescription,
        property: "og:description",
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
        content: "light",
        name: "color-scheme",
      },
      {
        content: "light dark",
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
  const { convexQueryClient } = useRouteContext({ from: "__root__" });

  return (
    <ConvexProvider client={convexQueryClient.convexClient}>
      <TooltipProvider>
        <Navbar />
        <main className="grow print:m-0 print:grow-0">
          <Outlet />
        </main>
        <Footer />
      </TooltipProvider>
    </ConvexProvider>
  );
}
