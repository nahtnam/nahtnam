import { formatDistance } from "date-fns";
import type { Metadata } from "next";
import { Fragment } from "react";
import { getPosts } from "./posts";

export const metadata: Metadata = {
  title: "@nahtnam's blog - Manthan Mallikarjun",
  description: "My adventures in building and using random things.",
  openGraph: {
    type: "website",
  },
};

export default async function Page() {
  const posts = await getPosts();

  return (
    <section className="prose prose-lg container my-12">
      <h1>My Blog</h1>
      <p>Welcome to my blog. I try to share my experiences building and using different things.</p>
      {posts.map((post) => {
        return (
          <Fragment key={post.slug}>
            <hr />
            <a href={`/blog/${post.slug}`} className="font-normal no-underline" key={post.slug}>
              <h2 className="mb-0">{post.metadata.title}</h2>
              <h6 className="mb-0">
                {post.metadata.author ? <span>By {post.metadata.author}, </span> : null}
                Published{" "}
                {formatDistance(post.metadata.publishedAt, new Date(), {
                  addSuffix: true,
                })}
              </h6>
              {post.metadata.summary ? <p className="mt-2">{post.metadata.summary}</p> : null}
            </a>
          </Fragment>
        );
      })}
    </section>
  );
}
