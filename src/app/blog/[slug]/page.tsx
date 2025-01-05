import { formatDistance } from "date-fns";
import { InlineTOC } from "fumadocs-ui/components/inline-toc";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blog } from "..";
import Link from "next/link";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blog.getPage([slug]);

  if (!post) return notFound();

  return {
    title: `${post.data.title} - Manthan Mallikarjun (@nahtnam)`,
    description: post.data.summary,
    alternates: {
      canonical: `https://www.nahtnam.com/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      authors: post.data.author ?? "Manthan Mallikarjun",
    },
  };
}

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page(props: PageProps) {
  const { params } = props;
  const { slug } = await params;
  const post = blog.getPage([slug]);

  if (!post) return notFound();

  if (!post) notFound();

  return (
    <section className="container mx-auto mt-12 max-w-5xl">
      <div className="prose prose-lg max-w-none">
        <p>
          <Link
            href="/blog"
            className="flex items-center text-blue-500 no-underline"
          >
            <ArrowLeftIcon className="mr-1 w-4" /> Back to all posts
          </Link>
        </p>
        <h1 className="mb-2">{post.data.title}</h1>
        <h6 className="mb-0">
          {post.data.author ? <span>By {post.data.author}, </span> : null}
          Published{" "}
          {formatDistance(post.data.publishedAt, new Date(), {
            addSuffix: true,
          })}
        </h6>
        <div className="my-4">
          <InlineTOC items={post.data.toc} />
        </div>
        <post.data.body components={defaultMdxComponents} />
      </div>
    </section>
  );
}
