import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

const COOKIE_NAME = "admin_token";

export const getAdminSecret = createServerFn({ method: "POST" }).handler(
  async () => getCookie(COOKIE_NAME) ?? "",
);

export const setAdminCookie = createServerFn({ method: "POST" })
  .inputValidator(z.object({ secret: z.string() }))
  .handler(async ({ data }) => {
    setCookie(COOKIE_NAME, data.secret, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });
