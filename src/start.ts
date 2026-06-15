import { createStart } from "@tanstack/react-start";
import { configure } from "@workos/authkit-session";
import { authkitMiddleware } from "@workos/authkit-tanstack-react-start";
import { appUrl } from "./lib/config";
import { serverEnv } from "./lib/config/server";

const authkitRedirectUri = new URL("/api/auth/callback", appUrl).toString();

configure({
  redirectUri: authkitRedirectUri,
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    authkitMiddleware({
      redirectUri: authkitRedirectUri,
    }),
  ],
}));

void serverEnv;
