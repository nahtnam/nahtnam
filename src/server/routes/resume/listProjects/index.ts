import { os } from "@orpc/server";
import { Cache } from "within-ts";
import { db } from "@/db";

const cachedListProjects = Cache.memoize(
  () =>
    db.query.resumeProjects.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
  { ttl: "1h" }
);

export const listProjects = os.handler(async () => {
  const projects = await cachedListProjects();
  return { projects };
});
