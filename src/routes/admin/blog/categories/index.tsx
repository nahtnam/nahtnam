/* eslint-disable sort-keys, react/jsx-no-bind */
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { createConvexRouteQuery } from "convex-route-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const schema = z.object({
  name: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

const listCategories = createConvexRouteQuery(api.admin.blog.listCategories);

export const Route = createFileRoute("/admin/blog/categories/")({
  component: CategoriesAdmin,
  async loader({ context }) {
    await listCategories.prefetchQuery(context.queryClient);
  },
});

function CategoriesAdmin() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"blogCategories"> | undefined>(
    undefined,
  );

  const { data: categories } = listCategories.useSuspenseQuery();

  const { mutateAsync: createCategory } = useMutation({
    mutationFn: useConvexMutation(api.admin.blog.createCategory),
  });
  const { mutateAsync: updateCategory } = useMutation({
    mutationFn: useConvexMutation(api.admin.blog.updateCategory),
  });
  const { mutateAsync: deleteCategory } = useMutation({
    mutationFn: useConvexMutation(api.admin.blog.deleteCategory),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  function openCreate() {
    setEditingId(undefined);
    form.reset({ name: "" });
    setOpen(true);
  }

  function openEdit(category: (typeof categories)[number]) {
    setEditingId(category._id);
    form.reset({ name: category.name });
    setOpen(true);
  }

  async function onSubmit(values: FormValues) {
    await (editingId
      ? updateCategory({ id: editingId, ...values })
      : createCategory({ ...values }));

    setOpen(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-[-0.02em]">
            Blog Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Categories used to organize blog posts.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit" : "Create"} Category
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        openEdit(category);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={async () => {
                        await deleteCategory({ id: category._id });
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
