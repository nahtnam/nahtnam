/* eslint-disable sort-keys, react/jsx-no-bind */
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useForm } from "react-hook-form";
import { useCallback, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, Trash2 } from "lucide-react";
import Markdown from "react-markdown";
import { z } from "zod";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAdminSecret } from "../../route";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title: z.string().min(1, "Required"),
  slug: z.string().min(1, "Required"),
  excerpt: z.string().min(1, "Required"),
  content: z.string().min(1, "Required"),
  categoryId: z.string().min(1, "Required"),
  publishedAt: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/blog/$id/")({
  component: BlogEditor,
});

function BlogEditor() {
  const adminSecret = useAdminSecret();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: existingPost } = useQuery({
    ...convexQuery(
      api.blog.queries.getPostById,
      isNew ? "skip" : { id: id as Id<"blogPosts"> },
    ),
    enabled: !isNew,
  });

  const { data: categories = [] } = useQuery(
    convexQuery(api.blog.queries.listCategories, {}),
  );

  const { mutateAsync: createPost } = useMutation({
    mutationFn: useConvexMutation(api.blog.mutations.createPost),
  });
  const { mutateAsync: updatePost } = useMutation({
    mutationFn: useConvexMutation(api.blog.mutations.updatePost),
  });
  const { mutateAsync: deletePost } = useMutation({
    mutationFn: useConvexMutation(api.blog.mutations.deletePost),
  });
  const { mutateAsync: generateUploadUrl } = useMutation({
    mutationFn: useConvexMutation(api.blog.mutations.generateUploadUrl),
  });
  const { mutateAsync: getImageUrl } = useMutation({
    mutationFn: useConvexMutation(api.blog.mutations.getImageUrl),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: existingPost
      ? {
          title: existingPost.title,
          slug: existingPost.slug,
          excerpt: existingPost.excerpt,
          content: existingPost.content,
          categoryId: existingPost.categoryId,
          publishedAt: new Date(existingPost.publishedAt)
            .toISOString()
            .slice(0, 16),
        }
      : {
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          categoryId: "",
          publishedAt: new Date().toISOString().slice(0, 16),
        },
  });

  const contentValue = form.watch("content");

  async function onSubmit(values: FormValues) {
    const data = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content: values.content,
      categoryId: values.categoryId as Id<"blogCategories">,
      publishedAt: new Date(values.publishedAt).getTime(),
    };

    await (isNew
      ? createPost({ adminSecret, ...data })
      : updatePost({ adminSecret, id: id as Id<"blogPosts">, ...data }));

    await navigate({ to: "/admin/blog" });
  }

  async function handleDelete() {
    if (!isNew) {
      await deletePost({ adminSecret, id: id as Id<"blogPosts"> });
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
        const uploadUrl = await generateUploadUrl({ adminSecret });
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = (await result.json()) as { storageId: string };
        const url = await getImageUrl({
          adminSecret,
          storageId: storageId as Id<"_storage">,
        });

        if (url) {
          const markdown = `![${file.name}](${url})`;
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const currentContent = form.getValues("content");
            const newContent =
              currentContent.slice(0, start) +
              markdown +
              currentContent.slice(textarea.selectionEnd);
            form.setValue("content", newContent);
          } else {
            const currentContent = form.getValues("content");
            form.setValue("content", `${currentContent}\n${markdown}`);
          }
        }
      } finally {
        setUploading(false);
      }
    });

    input.click();
  }, [adminSecret, form, generateUploadUrl, getImageUrl]);

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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild size="icon" variant="ghost">
            <a href="/admin/blog">
              <ArrowLeft className="size-4" />
            </a>
          </Button>
          <h1 className="font-semibold text-2xl">
            {isNew ? "New Post" : "Edit Post"}
          </h1>
        </div>
        {!isNew && (
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-1 size-4" />
            Delete
          </Button>
        )}
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Content</FormLabel>
                  <Button
                    disabled={uploading}
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={handleImageUpload}
                  >
                    {uploading ? (
                      <Loader2 className="mr-1 size-4 animate-spin" />
                    ) : (
                      <ImagePlus className="mr-1 size-4" />
                    )}
                    Upload Image
                  </Button>
                </div>
                <Tabs defaultValue="write">
                  <TabsList>
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write">
                    <FormControl>
                      <Textarea
                        ref={(element) => {
                          field.ref(element);
                          textareaRef.current = element;
                        }}
                        className="min-h-96 font-mono text-sm"
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="prose prose-neutral min-h-96 max-w-none rounded-md border p-4">
                      <Markdown>{contentValue}</Markdown>
                    </div>
                  </TabsContent>
                </Tabs>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">{isNew ? "Create Post" : "Update Post"}</Button>
        </form>
      </Form>
    </div>
  );
}
