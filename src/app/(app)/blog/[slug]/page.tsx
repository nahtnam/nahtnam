import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { load } from "outstatic/server";
import { Suspense } from "react";
import { getDocumentBySlug } from "@/app/(cms)/_utils/fetch";
import { env } from "@/config/env/server";
import markdownToHtml from "@/lib/remark";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPost(slug: string, isDraftMode: boolean) {
  const fields = [
    "title",
    "content",
    "publishedAt",
    "summary",
    "author",
  ] as const;
  const post = getDocumentBySlug("posts", slug, fields);

  if (isDraftMode) {
    const db = await load();
    const draftPost = await db
      .find(
        {
          collection: "posts",
          slug,
        },
        [...fields]
      )
      .first();

    return draftPost as unknown as typeof post;
  }

  return post;
}

async function Post(props: PageProps) {
  "use cache";
  const { params } = props;
  const { slug } = await params;
  const post = await getPost(slug, env.DRAFT_MODE);

  if (!post) {
    return notFound();
  }

  return (
    <>
      <h1 className="mb-2">{post.title}</h1>
      <h6 className="mb-0">
        <span>By {post.author?.name}, </span>
        Published{" "}
        {formatDistance(post.publishedAt, new Date(), {
          addSuffix: true,
        })}
      </h6>
      <div className="my-4" />
      <div
        // biome-ignore lint/security/noDangerouslySetInnerHtml: blog post rendering
        dangerouslySetInnerHTML={{
          __html: await markdownToHtml(post.content),
        }}
      />
    </>
  );
}

export default function Page(props: PageProps) {
  const { params } = props;

  return (
    <section className="container mx-auto mt-12 max-w-5xl">
      <article className="prose prose-lg max-w-none">
        <p>
          <Link
            className="flex items-center text-blue-500 no-underline"
            href="/blog"
          >
            <FontAwesomeIcon className="mr-1 w-4" icon={faArrowLeft} /> Back to
            all posts
          </Link>
        </p>
        <Suspense>
          <Post params={params} />
        </Suspense>
      </article>
    </section>
  );
}
