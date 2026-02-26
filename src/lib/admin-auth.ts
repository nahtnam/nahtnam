import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { serverEnv } from "./config/server";

const COOKIE_NAME = "admin_token";

export const checkAdminAuth = createServerFn({ method: "GET" }).handler(
  async () => {
    const token = getCookie(COOKIE_NAME);
    return token === serverEnv.ADMIN_SECRET;
  },
);

export const getAdminSecret = createServerFn({ method: "GET" }).handler(
  async () => {
    const token = getCookie(COOKIE_NAME);
    if (token !== serverEnv.ADMIN_SECRET) {
      throw new Error("Unauthorized");
    }

    return token;
  },
);

export const setAdminCookie = createServerFn({ method: "GET" })
  .inputValidator(z.object({ secret: z.string() }))
  .handler(async ({ data }) => {
    if (data.secret !== serverEnv.ADMIN_SECRET) {
      return false;
    }

    setCookie(COOKIE_NAME, data.secret, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: true,
    });

    return true;
  });
