import { authedQuery, isAdminIdentity } from "../fluent";

export const isAuthorized = authedQuery
  .input({})
  .handler((ctx) => Promise.resolve(isAdminIdentity(ctx.identity)))
  .public();
