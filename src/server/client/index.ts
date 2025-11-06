import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { routes } from "../routes";

declare global {
  var $orpcClient: RouterClient<typeof routes> | undefined;
}

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      throw new Error("RPCLink is not allowed on the server side.");
    }

    return `${window.location.origin}/rpc`;
  },
});

export const orpcClient: RouterClient<typeof routes> =
  globalThis.$orpcClient ?? createORPCClient(link);
