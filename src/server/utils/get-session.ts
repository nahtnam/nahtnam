import { getRequestHeaders } from "@tanstack/react-start/server";
import { cache } from "react";
import { auth } from "@/lib/auth";

export const getSession = cache(async () =>
  auth.api.getSession({
    headers: getRequestHeaders(),
  })
);
