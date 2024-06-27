import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Toc } from "@stefanprobst/rehype-extract-toc";
import type { ComponentType } from "react";

type Post = {
  default: ComponentType<unknown>;
  metadata: {
    title: string;
    publishedAt: Date;
    summary?: string;
    author?: string;
  };
  tableOfContents: Toc;
  slug: string;
};

export async function getPosts(): Promise<Post[]> {
  const path = join(process.cwd(), "src/app/(app)/blog/posts");
  const folders = await readdir(path);

  const posts = await Promise.all(folders.map((slug) => getPost(slug)));

  return posts
    .filter((post): post is Post => Boolean(post))
    .sort((a, b) => b.metadata.publishedAt.getTime() - a.metadata.publishedAt.getTime());
}

export async function getPost(slug: string): Promise<Post | null> {
  const path = join(process.cwd(), `src/app/(app)/blog/posts/${slug}/index.mdx`);
  const exists = existsSync(path);

  if (!exists) return null;

  const post = await import(`./posts/${slug}/index.mdx`);
  post.slug = slug;

  return post as Post;
}
