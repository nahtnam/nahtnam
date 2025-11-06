import { env as serverEnv } from "./env/server";

export const google =
  serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET
    ? {
        clientId: serverEnv.GOOGLE_CLIENT_ID,
        clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      }
    : undefined;
