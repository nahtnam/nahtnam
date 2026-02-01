import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { BetterAuthClientOptions } from "better-auth";
import { createAuthClient } from "better-auth/react";
import { serverEnv } from "@/config/env/server";

const opts = {} satisfies BetterAuthClientOptions;

export const authClient = createIsomorphicFn()
  .server(() =>
    createAuthClient({
      ...opts,
      baseURL: serverEnv.BETTER_AUTH_URL,
      fetchOptions: {
        headers: getRequestHeaders(),
      },
    })
  )
  .client(() =>
    createAuthClient({
      ...opts,
    })
  );
