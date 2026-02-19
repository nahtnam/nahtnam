import { os } from "@orpc/server";
import { Cache } from "within-ts";
import { db } from "@/db";

const cachedListPosts = Cache.memoize(
  () =>
    db.query.blogPosts.findMany({
      orderBy: {
        publishedAt: "desc",
      },
      where: {
        publishedAt: { lte: new Date() },
      },
      with: {
        category: true,
      },
    }),
  { ttl: "5m" }
);

export const listPosts = os.handler(async () => {
  const posts = await cachedListPosts();
  return { posts };
});
