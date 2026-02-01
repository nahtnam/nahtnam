import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import {
  Provider as TanstackQueryProvider,
  getContext as tanstackQueryGetContext,
} from "./routes/-components/tanstack-query/root-provider";

import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const rqContext = tanstackQueryGetContext();

  const router = createRouter({
    context: { ...rqContext },
    defaultPreload: "intent",
    routeTree,
    Wrap: (props: { children: React.ReactNode }) => (
      <TanstackQueryProvider {...rqContext}>
        {props.children}
      </TanstackQueryProvider>
    ),
  });

  setupRouterSsrQueryIntegration({
    queryClient: rqContext.queryClient,
    router,
  });

  return router;
};
