/* eslint-disable sort-keys, react/jsx-no-bind */
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { useAction } from "convex/react";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";
import type { FunctionReturnType } from "convex/server";
import {
  ArrowLeft,
  Copy,
  ImagePlus,
  Loader2,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import Markdown from "react-markdown";
import { z } from "zod";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { createConvexRouteQuery } from "convex-route-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  availableBlogContentPaths,
  getBlogMarkdownContent,
} from "@/lib/blog/markdown";

const schema = z
  .object({
    categoryId: z.string().min(1, "Required"),
    contentPath: z.string(),
    excerpt: z.string(),
    kind: z.enum(["markdown", "x"]),
    published: z.boolean(),
    publishedAt: z.string().min(1, "Required"),
    slug: z.string(),
    title: z.string(),
    tweetInput: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.kind === "markdown") {
      for (const field of [
        "title",
        "slug",
        "excerpt",
        "contentPath",
      ] as const) {
        if (!values[field].trim()) {
          ctx.addIssue({
            code: "custom",
            message: "Required",
            path: [field],
          });
        }
      }

      return;
    }

    if (!values.tweetInput.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Required",
        path: ["tweetInput"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;
type BlogPost = NonNullable<
  FunctionReturnType<typeof api.admin.blog.getPostById>
>;
type BlogCategory = FunctionReturnType<
  typeof api.admin.blog.listCategories
>[number];
type BlogMedia = FunctionReturnType<typeof api.admin.blog.listMedia>[number];

type BlogPostFormProps = {
  readonly categories: BlogCategory[];
  readonly media: BlogMedia[];
  readonly post?: BlogPost;
};

type EditBlogPostFormProps = {
  readonly categories: BlogCategory[];
  readonly id: Id<"blogPosts">;
  readonly media: BlogMedia[];
};

function toLocalDateTime(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

export const Route = createFileRoute("/admin/blog/$id/")({
  component: BlogEditor,
  async loader({ context, params }) {
    await Promise.all([
      listCategories.prefetchQuery(context.queryClient),
      listMedia.prefetchQuery(context.queryClient),
      params.id === "new"
        ? Promise.resolve()
        : getPostById.prefetchQuery(context.queryClient, {
            id: params.id as Id<"blogPosts">,
          }),
    ]);
  },
});

const getPostById = createConvexRouteQuery(api.admin.blog.getPostById);
const listCategories = createConvexRouteQuery(api.admin.blog.listCategories);
const listMedia = createConvexRouteQuery(api.admin.blog.listMedia);

function BlogEditor() {
  const { id } = Route.useParams();
  const { data: categories } = listCategories.useSuspenseQuery();
  const { data: media } = listMedia.useSuspenseQuery();

  if (id === "new") {
    return <BlogPostForm categories={categories} media={media} />;
  }

  return (
    <EditBlogPostForm
      categories={categories}
      id={id as Id<"blogPosts">}
      media={media}
    />
  );
}

function EditBlogPostForm(props: EditBlogPostFormProps) {
  const { categories, id, media } = props;
  const { data: post } = getPostById.useSuspenseQuery({ id });

  return (
    <BlogPostForm
      categories={categories}
      media={media}
      post={post ?? undefined}
    />
  );
}

function BlogPostForm(props: BlogPostFormProps) {
  const { categories, media, post } = props;
  const navigate = useNavigate();
  const isNew = !post;
  const [uploading, setUploading] = useState(false);
  const [uploadedMarkdown, setUploadedMarkdown] = useState("");

  const { mutateAsync: createPost } = useMutation({
    mutationFn: useConvexMutation(api.admin.blog.createPost),
  });
  const { mutateAsync: updatePost } = useMutation({
    mutationFn: useConvexMutation(api.admin.blog.updatePost),
  });
  const { mutateAsync: deletePost } = useMutation({
    mutationFn: useConvexMutation(api.admin.blog.deletePost),
  });
  const saveImportedXPost = useAction(api.admin.blog.saveImportedXPost);
  const { mutateAsync: saveImportedXPostMutation } = useMutation({
    mutationFn: saveImportedXPost,
  });
  const refreshXPost = useAction(api.admin.blog.refreshXPost);
  const { mutateAsync: refreshXPostMutation, isPending: refreshing } =
    useMutation({
      mutationFn: refreshXPost,
    });
  const { mutateAsync: generateUploadUrl } = useMutation({
    mutationFn: useConvexMutation(api.admin.blog.generateUploadUrl),
  });
  const { mutateAsync: createMedia } = useMutation({
    mutationFn: useConvexMutation(api.admin.blog.createMedia),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      contentPath: "",
      categoryId: "",
      kind: "markdown",
      published: true,
      publishedAt: toLocalDateTime(new Date()),
      tweetInput: "",
    },
    values: post
      ? {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          contentPath: post.contentPath ?? `content/blog/${post.slug}.md`,
          categoryId: post.categoryId,
          kind: post.kind ?? "markdown",
          published: post.published,
          publishedAt: toLocalDateTime(new Date(post.publishedAt)),
          tweetInput:
            post.tweets?.map(({ sourceUrl }) => sourceUrl).join("\n") ?? "",
        }
      : undefined,
  });

  const kind = form.watch("kind");
  const contentPath = form.watch("contentPath");
  const markdownPreview = getBlogMarkdownContent(contentPath);

  async function onSubmit(values: FormValues) {
    if (values.kind === "x") {
      await saveImportedXPostMutation({
        categoryId: values.categoryId as Id<"blogCategories">,
        excerpt: values.excerpt || undefined,
        id: post?._id,
        published: values.published,
        publishedAt: new Date(values.publishedAt).getTime(),
        slug: values.slug || undefined,
        title: values.title || undefined,
        tweetInput: values.tweetInput,
      });

      await navigate({ to: "/admin/blog" });
      return;
    }

    const data = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      contentPath: values.contentPath,
      categoryId: values.categoryId as Id<"blogCategories">,
      published: values.published,
      publishedAt: new Date(values.publishedAt).getTime(),
    };

    await (isNew ? createPost(data) : updatePost({ id: post._id, ...data }));

    await navigate({ to: "/admin/blog" });
  }

  async function handleDelete() {
    if (post) {
      await deletePost({ id: post._id });
      await navigate({ to: "/admin/blog" });
    }
  }

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      setUploading(true);
      try {
        const uploadUrl = await generateUploadUrl({});
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = (await result.json()) as { storageId: string };
        const media = await createMedia({
          contentType: file.type || undefined,
          name: file.name,
          postId: post?._id,
          storageId: storageId as Id<"_storage">,
        });

        if (media.markdown) {
          setUploadedMarkdown(media.markdown);
          await navigator.clipboard.writeText(media.markdown);
        }
      } finally {
        setUploading(false);
      }
    });

    input.click();
  }, [createMedia, generateUploadUrl, post?._id]);

  function generateSlug() {
    const title = form.getValues("title");
    const slug = title
      .toLowerCase()
      .replaceAll(/[^\w\s-]/g, "")
      .replaceAll(/\s+/g, "-")
      .replaceAll(/-+/g, "-")
      .trim();
    form.setValue("slug", slug);
  }

  async function handleRefreshTweets() {
    if (post) {
      await refreshXPostMutation({ id: post._id });
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button asChild size="icon-sm" variant="ghost">
            <a href="/admin/blog">
              <ArrowLeft className="size-4" />
            </a>
          </Button>
          <div>
            <h1 className="font-serif text-3xl tracking-[-0.02em]">
              {isNew ? "New Post" : "Edit Post"}
            </h1>
          </div>
        </div>
        {!isNew && (
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        )}
      </div>

      <Form {...form}>
        <form
          className="space-y-4 rounded-xl border border-border bg-card p-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="x">X Thread</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onBlur={(event) => {
                        field.onBlur();
                        if (!form.getValues("slug") && event.target.value) {
                          generateSlug();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publishedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel>Published</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {kind === "x" ? (
            <FormField
              control={form.control}
              name="tweetInput"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Tweet URL or URLs</FormLabel>
                    {isNew ? null : (
                      <Button
                        disabled={refreshing}
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={handleRefreshTweets}
                      >
                        {refreshing ? (
                          <Loader2 className="mr-1 size-4 animate-spin" />
                        ) : (
                          <RefreshCcw className="mr-1 size-4" />
                        )}
                        Refresh Tweets
                      </Button>
                    )}
                  </div>
                  <FormControl>
                    <Textarea
                      className="min-h-32 font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="contentPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Markdown File</FormLabel>
                    <FormControl>
                      <Input
                        list="blog-content-paths"
                        placeholder="content/blog/example.md"
                        {...field}
                      />
                    </FormControl>
                    <datalist id="blog-content-paths">
                      {availableBlogContentPaths.map((path) => (
                        <option key={path} value={path} />
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <FormLabel>Media</FormLabel>
                  <Button
                    disabled={uploading}
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={handleImageUpload}
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ImagePlus className="size-4" />
                    )}
                    Upload Image
                  </Button>
                </div>
                {uploadedMarkdown ? (
                  <div className="flex gap-2">
                    <Input readOnly value={uploadedMarkdown} />
                    <Button
                      size="icon-sm"
                      title="Copy image markdown"
                      type="button"
                      variant="outline"
                      onClick={async () =>
                        navigator.clipboard.writeText(uploadedMarkdown)
                      }
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                ) : null}
                <div className="grid gap-2">
                  {media.map((item) => {
                    const markdown = item.url
                      ? `![${item.name}](${item.url})`
                      : "";

                    return (
                      <div
                        key={item._id}
                        className="flex items-center gap-2 rounded-md border border-border bg-card p-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {item.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.url}
                          </p>
                        </div>
                        <Button
                          disabled={!markdown}
                          size="icon-sm"
                          title="Copy image markdown"
                          type="button"
                          variant="ghost"
                          onClick={async () =>
                            navigator.clipboard.writeText(markdown)
                          }
                        >
                          <Copy className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="prose prose-neutral min-h-64 max-w-none rounded-lg border border-border bg-background p-4">
                <Markdown>
                  {markdownPreview ??
                    "No bundled markdown file found for this path yet."}
                </Markdown>
              </div>
            </div>
          )}

          <Button type="submit">{isNew ? "Create Post" : "Update Post"}</Button>
        </form>
      </Form>
    </div>
  );
}
