import { os } from "@orpc/server";
import { z } from "zod";
import { db } from "@/db";

export const getPost = os
  .input(z.object({ slug: z.string() }))
  .handler(async ({ input }) => {
    const now = new Date();
    const post = await db.query.blogPosts.findFirst({
      where: {
        publishedAt: { lte: now },
        slug: input.slug,
      },
      with: {
        category: true,
      },
    });

    return { post };
  });
