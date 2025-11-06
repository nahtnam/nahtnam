import { baseOs } from "@/server";

export const getSession = baseOs.handler(({ context }) => {
  const { user, session } = context;

  if (!user) {
    return null;
  }

  return {
    session,
    user,
  };
});
