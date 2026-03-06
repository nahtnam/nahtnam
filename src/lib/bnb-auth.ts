import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

const COOKIE_NAME = "bnb_token";

export const checkBnbAuth = createServerFn({ method: "GET" }).handler(
  async () => {
    const token = getCookie(COOKIE_NAME);
    return Boolean(token);
  },
);

export const getBnbPassword = createServerFn({ method: "GET" }).handler(
  async () => {
    const token = getCookie(COOKIE_NAME);
    if (!token) {
      throw new Error("Unauthorized");
    }

    return token;
  },
);

export const setBnbCookie = createServerFn({ method: "GET" })
  .inputValidator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    setCookie(COOKIE_NAME, data.password, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: true,
    });

    return true;
  });
