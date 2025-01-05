import { formatDistance } from "date-fns";
import type { Metadata } from "next";
import { Fragment } from "react";
import { blog } from ".";

export const metadata: Metadata = {
  title: "@nahtnam's blog - Manthan Mallikarjun",
  description: "My adventures in building and using random things.",
  openGraph: {
    type: "website",
  },
};

async function getDate() {
  "use cache";
  return new Date();
}
export default async function Page() {
  const posts = [...blog.getPages()].sort(
    (a, b) =>
      new Date(b.data.publishedAt ?? b.file.name).getTime() -
      new Date(a.data.publishedAt ?? a.file.name).getTime(),
  );
  const currentDate = await getDate();

  return (
    <section className="container prose prose-lg mx-auto my-12 max-w-5xl">
      <h1>My Blog</h1>
      <p>
        Welcome to my blog. I try to share my experiences building and using
        different things.
      </p>
      {posts.map((post) => {
        return (
          <Fragment key={post.url}>
            <hr />
            <a href={`${post.url}`} className="font-normal no-underline">
              <h2 className="mb-0">{post.data.title}</h2>
              <h6 className="mb-0">
                {post.data.author ? <span>By {post.data.author}, </span> : null}
                Published{" "}
                {formatDistance(post.data.publishedAt, currentDate, {
                  addSuffix: true,
                })}
              </h6>
              {post.data.summary ? (
                <p className="mt-2">{post.data.summary}</p>
              ) : null}
            </a>
          </Fragment>
        );
      })}
    </section>
  );
}
