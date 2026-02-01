import { os } from "@orpc/server";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const baseOs = os.use(async ({ next }) =>
  next({
    context: {
      headers: getRequestHeaders(),
    },
  })
);
