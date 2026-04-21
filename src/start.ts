import { createStart } from "@tanstack/react-start";
import { authkitMiddleware } from "@workos/authkit-tanstack-react-start";
import { serverEnv } from "./lib/config/server";

export const startInstance = createStart(() => ({
  requestMiddleware: [
    authkitMiddleware({
      redirectUri: serverEnv.WORKOS_REDIRECT_URI,
    }),
  ],
}));
