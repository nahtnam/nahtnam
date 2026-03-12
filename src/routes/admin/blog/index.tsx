import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { Pencil, Plus } from "lucide-react";
import { api } from "convex/_generated/api";
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

export const Route = createFileRoute("/admin/blog/")({
  component: BlogAdmin,
});

function BlogAdmin() {
  const { adminSecret } = Route.useRouteContext();
  const { data: posts = [] } = useQuery(
    convexQuery(api.admin.blog.listAllPosts, { adminSecret }),
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Blog Posts</h1>
        <Button asChild size="sm">
          <Link to="/admin/blog/$id" params={{ id: "new" }}>
            <Plus className="mr-1 size-4" />
            New Post
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Published</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => {
            const isPublished = post.publishedAt <= Date.now();
            return (
              <TableRow key={post._id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{post.category.name}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {post.slug}
                </TableCell>
                <TableCell>
                  <Badge variant={isPublished ? "default" : "outline"}>
                    {isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button asChild size="icon" variant="ghost">
                    <Link to="/admin/blog/$id" params={{ id: post._id }}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
