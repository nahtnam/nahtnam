import { os } from "@orpc/server";
import { Cache } from "within-ts";
import { z } from "zod";
import { db } from "@/db";

const cachedGetPost = Cache.memoize(
  (slug: string) =>
    db.query.blogPosts.findFirst({
      where: {
        publishedAt: { lte: new Date() },
        slug,
      },
      with: {
        category: true,
      },
    }),
  { ttl: "5m" }
);

export const getPost = os
  .input(z.object({ slug: z.string() }))
  .handler(async ({ input }) => {
    const post = await cachedGetPost(input.slug);
    return { post };
  });
