import { ORPCError, os } from "@orpc/server";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getSession } from "./utils/get-session";

export const baseOs = os.use(async ({ next }) =>
  next({
    context: {
      headers: getRequestHeaders(),
      ...(await getSession()),
    },
  })
);

export const withoutUserOs = baseOs.use(({ context, next }) => {
  const { user, session } = context;

  if (user || session) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      ...context,
      session,
      user,
    },
  });
});

export const withUserOs = baseOs.use(({ context, next }) => {
  const { user, session } = context;

  if (!(user && session)) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      ...context,
      session,
      user,
    },
  });
});
