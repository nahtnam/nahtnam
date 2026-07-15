import type { AuthConfig } from "convex/server";

import { env } from "./_generated/server";

export default {
  providers: [
    {
      algorithm: "RS256",
      applicationID: env.WORKOS_CLIENT_ID,
      issuer: "https://api.workos.com/",
      jwks: `https://api.workos.com/sso/jwks/${env.WORKOS_CLIENT_ID}`,
      type: "customJwt",
    },
    {
      algorithm: "RS256",
      issuer: `https://api.workos.com/user_management/${env.WORKOS_CLIENT_ID}`,
      jwks: `https://api.workos.com/sso/jwks/${env.WORKOS_CLIENT_ID}`,
      type: "customJwt",
    },
  ],
} satisfies AuthConfig;
