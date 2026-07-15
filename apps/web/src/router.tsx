import { ConvexQueryClient } from "@convex-dev/react-query";
import { clientEnv } from "@repo/config/env/client";
import { QueryClient } from "@tanstack/react-query";
import { createControlledPromise, createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import type {
  NoUserInfo,
  UserInfo,
} from "@workos/authkit-tanstack-react-start";

import { ErrorComponent } from "./routes/-components/error-component";
import { PendingComponent } from "./routes/-components/pending-component";
import { routeTree } from "./routeTree.gen";

type ServerAuth = NoUserInfo | UserInfo;

type ServerAuthResult =
  | { auth: ServerAuth; status: "ready" }
  | { error: unknown; status: "error" };

function createServerAuthState() {
  const result = createControlledPromise<ServerAuthResult>();

  return {
    fail(error: unknown) {
      if (result.status !== "pending") {
        return;
      }

      result.resolve({ error, status: "error" });
    },
    resolve(auth: ServerAuth) {
      if (result.status !== "pending") {
        return;
      }

      result.resolve({ auth, status: "ready" });
    },
    async wait() {
      const authResult = await result;

      if (authResult.status === "error") {
        throw authResult.error;
      }

      return authResult.auth;
    },
  };
}

export function getRouter() {
  const convexQueryClient = new ConvexQueryClient(clientEnv.VITE_CONVEX_URL);
  const convexQueryFn = convexQueryClient.queryFn();
  const serverAuthState = createServerAuthState();

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        async queryFn(context) {
          const [queryType] = context.queryKey;
          const isConvexRequest =
            queryType === "convexQuery" || queryType === "convexAction";

          if (convexQueryClient.serverHttpClient && isConvexRequest) {
            await serverAuthState.wait();
          }

          return convexQueryFn(context);
        },
        queryKeyHashFn: convexQueryClient.hashFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

  const router = createRouter({
    context: { convexQueryClient, queryClient, serverAuthState },
    defaultErrorComponent: ErrorComponent,
    defaultPendingComponent: PendingComponent,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    routeTree,
    scrollRestoration: true,
  });

  setupRouterSsrQueryIntegration({
    queryClient,
    router,
  });

  return router;
}

declare module "@tanstack/react-router" {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
