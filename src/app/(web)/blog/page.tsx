import { formatDistance } from "date-fns";
import { load } from "outstatic/server";
import { Fragment } from "react";
import { getDocuments } from "@/app/(cms)/_utils/fetch";
import { env } from "@/config/env/server";

async function getPosts(isDraftMode: boolean) {
  const fields = [
    "title",
    "content",
    "slug",
    "publishedAt",
    "summary",
    "author",
  ] as const;
  const posts = getDocuments("posts", fields);

  if (isDraftMode) {
    const db = await load();
    const postsWithDrafts = await db
      .find(
        {
          collection: "posts",
        },
        [...fields]
      )
      .toArray();

    return postsWithDrafts as unknown as typeof posts;
  }

  return posts;
}

// biome-ignore lint/suspicious/useAwait: cache components
async function getDate() {
  "use cache";
  return new Date();
}

export default async function Page() {
  "use cache";
  const posts = await getPosts(env.DRAFT_MODE);
  const currentDate = await getDate();

  return (
    <section className="prose prose-lg container mx-auto my-12 max-w-5xl">
      <h1>My Blog</h1>
      <p>
        Welcome to my blog. I try to share my experiences building and using
        different things.
      </p>
      {posts.map((post) => (
        <Fragment key={post.slug}>
          <hr />
          <a className="font-normal no-underline" href={`/blog/${post.slug}`}>
            <h2 className="mb-0">{post.title}</h2>
            <h6 className="mb-0">
              {post.author ? <span>By {post.author?.name}, </span> : null}
              Published{" "}
              {formatDistance(post.publishedAt, currentDate, {
                addSuffix: true,
              })}
            </h6>

            <p className="mt-2">{post.summary}</p>
          </a>
        </Fragment>
      ))}
    </section>
  );
}
