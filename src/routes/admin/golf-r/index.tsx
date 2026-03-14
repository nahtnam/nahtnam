/* eslint-disable sort-keys, react/jsx-no-bind */
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categories = [
  { label: "Vehicle Purchase", value: "purchase" },
  { label: "Taxes", value: "tax" },
  { label: "Fees & Registration", value: "fee" },
  { label: "Audio", value: "audio" },
  { label: "Performance", value: "performance" },
  { label: "Wheels & Tires", value: "wheels" },
  { label: "Exterior", value: "exterior" },
  { label: "Interior", value: "interior" },
];

const schema = z.object({
  name: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  price: z.coerce.number().min(0, "Must be >= 0"),
  discount: z.coerce.number().min(0).optional(),
  cashback: z.coerce.number().min(0).optional(),
  date: z.string().min(1, "Required"),
  description: z.string().optional(),
  url: z.string().optional(),
  sortOrder: z.coerce.number().int(),
  installed: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/golf-r/")({
  component: GolfRAdmin,
});

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount);
}

function GolfRAdmin() {
  const { adminSecret } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"golfRItems"> | undefined>(
    undefined,
  );

  const { data: items = [] } = useQuery(
    convexQuery(api.admin.golf_r.listItems, { adminSecret }),
  );

  const { mutateAsync: createItem } = useMutation({
    mutationFn: useConvexMutation(api.admin.golf_r.createItem),
  });
  const { mutateAsync: updateItem } = useMutation({
    mutationFn: useConvexMutation(api.admin.golf_r.updateItem),
  });
  const { mutateAsync: deleteItem } = useMutation({
    mutationFn: useConvexMutation(api.admin.golf_r.deleteItem),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      category: "purchase",
      price: 0,
      discount: undefined,
      cashback: undefined,
      date: "",
      description: "",
      url: "",
      sortOrder: 0,
      installed: undefined,
    },
  });

  function openCreate() {
    setEditingId(undefined);
    form.reset({
      name: "",
      category: "purchase",
      price: 0,
      discount: undefined,
      cashback: undefined,
      date: "",
      description: "",
      url: "",
      sortOrder: items.length,
      installed: undefined,
    });
    setOpen(true);
  }

  function openEdit(item: (typeof items)[number]) {
    setEditingId(item._id);
    form.reset({
      name: item.name,
      category: item.category,
      price: item.price,
      discount: item.discount ?? undefined,
      cashback: item.cashback ?? undefined,
      date: item.date,
      description: item.description ?? "",
      url: item.url ?? "",
      sortOrder: item.sortOrder,
      installed: item.installed ?? undefined,
    });
    setOpen(true);
  }

  async function onSubmit(values: FormValues) {
    const data = {
      ...values,
      description: values.description ?? undefined,
      url: values.url ?? undefined,
      discount: values.discount ?? undefined,
      cashback: values.cashback ?? undefined,
    };

    await (editingId
      ? updateItem({ adminSecret, id: editingId, ...data })
      : createItem({ adminSecret, ...data }));

    setOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Golf R</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1 size-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Add"} Item</DialogTitle>
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
                        <Input placeholder="e.g. Subwoofer Kit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cashback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cashback ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Order</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="installed"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <FormLabel>Installed</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Disc/CB</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-mono text-muted-foreground text-xs">
                {item.sortOrder}
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-sm">
                {categories.find((c) => c.value === item.category)?.label ??
                  item.category}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {formatUsd(item.price)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-emerald-600">
                {(item.discount ?? 0) > 0 && `-${formatUsd(item.discount)}`}
                {(item.cashback ?? 0) > 0 &&
                  `${(item.discount ?? 0) > 0 ? " / " : ""}-${formatUsd(item.cashback)}`}
              </TableCell>
              <TableCell className="text-sm">{item.date}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      openEdit(item);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      await deleteItem({ adminSecret, id: item._id });
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
  );
}
