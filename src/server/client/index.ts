import { createORPCClient, ORPCError, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { logger } from "@/lib/logtape";
import { routes } from "../routes";

const getORPCClient = createIsomorphicFn()
  .server(() => createRouterClient(routes))
  .client((): RouterClient<typeof routes> => {
    const link = new RPCLink({
      interceptors: [
        onError((error) => {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }

          if (error instanceof ORPCError) {
            toast.error(error.message);
            return;
          }

          logger.error(`${error}`);
          toast.error("An unexpected error occurred.");
        }),
      ],
      url: `${window.location.origin}/api/rpc`,
    });

    return createORPCClient(link);
  });

export const orpcClient: RouterClient<typeof routes> = getORPCClient();

export const orpcTanstackQueryClient = createTanstackQueryUtils(orpcClient);
