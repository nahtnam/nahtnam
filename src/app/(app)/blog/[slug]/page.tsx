import { baseUrl } from "@/config/app";
import { formatDistance } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost } from "../posts";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const post = await getPost(slug);

  if (!post) return notFound();

  return {
    title: `${post.metadata.title} - Manthan Mallikarjun (@nahtnam)`,
    description: post.metadata.summary,
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      authors: post.metadata.author ?? "Manthan Mallikarjun",
    },
  };
}

type PageProps = {
  params: {
    slug: string;
  };
};

function tocMargin(depth: number) {
  switch (depth) {
    case 1:
    case 2:
      return "ml-0";
    case 3:
      return "ml-4";
    case 4:
      return "ml-8";
    case 5:
      return "ml-12";
    case 6:
      return "ml-16";
    default:
      return "ml-0";
  }
}

export default async function Page(props: PageProps) {
  const { params } = props;
  const { slug } = params;
  const post = await getPost(slug);

  if (!post) notFound();

  const tableOfContents = post.tableOfContents.flatMap((toc) => {
    if (toc.children) {
      return [toc, ...toc.children];
    }
    return [toc];
  });

  return (
    <section className="container mt-12 flex flex-wrap gap-4 md:flex-nowrap">
      <div className="w-full md:w-1/3">
        <div className="sticky top-12">
          <a href="/blog" className="flex items-center text-blue-500">
            <ArrowLeftIcon className="mr-1 w-4" /> Back to all posts
          </a>
          <br />
          <div className="space-y-2">
            {tableOfContents.map((toc) => (
              <div className={tocMargin(toc.depth)} key={toc.id}>
                <a href={`#${toc.id ?? ""}`} className="underline">
                  {toc.value}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="prose prose-lg w-full md:w-2/3">
        <h1 className="mb-2">{post.metadata.title}</h1>
        <h6 className="mb-0">
          {post.metadata.author ? <span>By {post.metadata.author}, </span> : null}
          Published{" "}
          {formatDistance(post.metadata.publishedAt, new Date(), {
            addSuffix: true,
          })}
        </h6>
        <post.default />
      </div>
    </section>
  );
}
