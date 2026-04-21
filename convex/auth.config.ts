import type { AuthConfig } from "convex/server";
import { convexEnv } from "./lib/config/env";

export default {
  providers: [
    {
      algorithm: "RS256",
      applicationID: convexEnv.WORKOS_CLIENT_ID,
      issuer: "https://api.workos.com/",
      jwks: `https://api.workos.com/sso/jwks/${convexEnv.WORKOS_CLIENT_ID}`,
      type: "customJwt",
    },
    {
      algorithm: "RS256",
      issuer: `https://api.workos.com/user_management/${convexEnv.WORKOS_CLIENT_ID}`,
      jwks: `https://api.workos.com/sso/jwks/${convexEnv.WORKOS_CLIENT_ID}`,
      type: "customJwt",
    },
  ],
} satisfies AuthConfig;
