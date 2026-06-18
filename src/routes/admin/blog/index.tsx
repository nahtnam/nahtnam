import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { useAction } from "convex/react";
import { Pencil, Plus, RefreshCcw } from "lucide-react";
import { api } from "convex/_generated/api";
import { createConvexRouteQuery } from "convex-route-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const listAllPosts = createConvexRouteQuery(api.admin.blog.listAllPosts);

export const Route = createFileRoute("/admin/blog/")({
  component: BlogAdmin,
  async loader({ context }) {
    await listAllPosts.prefetchQuery(context.queryClient);
  },
});

function BlogAdmin() {
  const { data: posts } = listAllPosts.useSuspenseQuery();
  const { mutateAsync: backfillPublishedFlags } = useMutation({
    mutationFn: useConvexMutation(api.admin.blog.backfillPublishedFlags),
  });
  const { mutateAsync: backfillContent } = useMutation({
    mutationFn: useConvexMutation(api.admin.blog.backfillContent),
  });
  const refreshXPost = useAction(api.admin.blog.refreshXPost);
  const { mutateAsync: refreshXPostMutation, isPending: refreshing } =
    useMutation({
      mutationFn: refreshXPost,
    });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Blog Posts</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={async () => backfillPublishedFlags({})}
          >
            <RefreshCcw className="mr-1 size-4" />
            Backfill Published
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => backfillContent({})}
          >
            <RefreshCcw className="mr-1 size-4" />
            Backfill Content
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/blog/$id" params={{ id: "new" }}>
              <Plus className="mr-1 size-4" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Published</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post._id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>
                <Badge variant="secondary">{post.category.name}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    (post.kind ?? "markdown") === "x" ? "default" : "outline"
                  }
                >
                  {(post.kind ?? "markdown") === "x" ? "X" : "Markdown"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {post.slug}
              </TableCell>
              <TableCell>
                <Badge variant={post.published ? "default" : "outline"}>
                  {post.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                {(post.kind ?? "markdown") === "x" ? (
                  <Button
                    disabled={refreshing}
                    size="icon"
                    title="Refresh tweets"
                    variant="ghost"
                    onClick={async () => refreshXPostMutation({ id: post._id })}
                  >
                    <RefreshCcw className="size-4" />
                  </Button>
                ) : null}
                <Button asChild size="icon" title="Edit" variant="ghost">
                  <Link to="/admin/blog/$id" params={{ id: post._id }}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
