import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { appName, appUrl } from "@/config/app";
import appCss from "../styles.css?url";
import { Footer } from "./-components/footer";
import { Navbar } from "./-components/navbar";
import { NotFound } from "./-components/not-found";
import TanStackQueryDevtools from "./-components/tanstack-query/devtools";
import { Toaster } from "./-shadcn/components/ui/sonner";

interface MyRouterContext {
  queryClient: QueryClient;
}

const defaultDescription =
  "Manthan (@nahtnam) - Principal Software Engineer at Mercury. Writing about software, startups, and personal finance.";

export const Route = createRootRouteWithContext<MyRouterContext>()({
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
  return (
    <>
      <Navbar />
      <main className="grow print:m-0 print:grow-0">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
