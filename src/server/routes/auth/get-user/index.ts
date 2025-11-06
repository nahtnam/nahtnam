import { withUserOs } from "@/server";

export const getUser = withUserOs.handler(({ context }) => {
  const { user, session } = context;

  return {
    session,
    user,
  };
});
