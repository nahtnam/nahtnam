import { os } from "@orpc/server";
import { db } from "@/db";

export const listPosts = os.handler(async () => {
  const now = new Date();
  const posts = await db.query.blogPosts.findMany({
    orderBy: {
      publishedAt: "desc",
    },
    where: {
      publishedAt: { lte: now },
    },
    with: {
      category: true,
    },
  });

  return { posts };
});
