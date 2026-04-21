import { createStart } from "@tanstack/react-start";
import { authkitMiddleware } from "@workos/authkit-tanstack-react-start";
import { appUrl } from "./lib/config";
import { serverEnv } from "./lib/config/server";

export const startInstance = createStart(() => ({
  requestMiddleware: [
    authkitMiddleware({
      redirectUri: new URL("/api/auth/callback", appUrl).toString(),
    }),
  ],
}));

void serverEnv;
