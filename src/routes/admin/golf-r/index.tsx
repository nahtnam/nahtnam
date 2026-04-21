/* eslint-disable sort-keys, react/jsx-no-bind */
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useForm } from "react-hook-form";
import { useRef, useState, type ChangeEvent } from "react";
import {
  Loader2,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { z } from "zod";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { sortGolfRItems } from "@/routes/golf-r/-components/lib";
import { Badge } from "@/components/ui/badge";
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
  { label: "Equipment", value: "equipment" },
  { label: "Performance", value: "performance" },
  { label: "Wheels & Tires", value: "wheels" },
  { label: "Exterior", value: "exterior" },
  { label: "Interior", value: "interior" },
  { label: "Maintenance", value: "maintenance" },
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
  mileage: z.coerce.number().int().min(0).optional(),
  modification: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

type AttachmentValue = {
  readonly contentType?: string;
  readonly name: string;
  readonly storageId: Id<"_storage">;
  readonly url?: string;
};

export const Route = createFileRoute("/admin/golf-r/")({
  component: GolfRAdmin,
});

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount);
}

function sameAttachmentIds(
  left: readonly AttachmentValue[],
  right: readonly AttachmentValue[],
) {
  return (
    left.length === right.length &&
    left.every(
      (attachment, index) => attachment.storageId === right[index]?.storageId,
    )
  );
}

function GolfRAdmin() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<AttachmentValue[]>([]);
  const [initialAttachmentIds, setInitialAttachmentIds] = useState<
    Array<Id<"_storage">>
  >([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"golfRItems"> | undefined>(
    undefined,
  );
  const [uploading, setUploading] = useState(false);

  const { data = [] } = useQuery(convexQuery(api.admin.golf_r.listItems, {}));
  const items = sortGolfRItems(data);

  const { mutateAsync: createItem } = useMutation({
    mutationFn: useConvexMutation(api.admin.golf_r.createItem),
  });
  const { mutateAsync: updateItem } = useMutation({
    mutationFn: useConvexMutation(api.admin.golf_r.updateItem),
  });
  const { mutateAsync: deleteItem } = useMutation({
    mutationFn: useConvexMutation(api.admin.golf_r.deleteItem),
  });
  const { mutateAsync: generateUploadUrl } = useMutation({
    mutationFn: useConvexMutation(api.admin.golf_r.generateUploadUrl),
  });
  const { mutateAsync: getAttachmentUrl } = useMutation({
    mutationFn: useConvexMutation(api.admin.golf_r.getAttachmentUrl),
  });
  const { mutateAsync: deleteAttachment } = useMutation({
    mutationFn: useConvexMutation(api.admin.golf_r.deleteAttachment),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      name: "",
      category: "purchase",
      price: 0,
      discount: undefined,
      cashback: undefined,
      date: "",
      description: "",
      url: "",
      mileage: undefined,
      modification: undefined,
    },
  });

  function resetEditor() {
    setAttachments([]);
    setEditingId(undefined);
    setInitialAttachmentIds([]);
    form.reset({
      name: "",
      category: "purchase",
      price: 0,
      discount: undefined,
      cashback: undefined,
      date: "",
      description: "",
      url: "",
      mileage: undefined,
      modification: undefined,
    });
  }

  async function cleanupDraftAttachments() {
    const initialIds = new Set(initialAttachmentIds);
    const draftAttachments = attachments.filter(
      (attachment) => !initialIds.has(attachment.storageId),
    );

    await Promise.all(
      draftAttachments.map(async (attachment) =>
        deleteAttachment({ storageId: attachment.storageId }),
      ),
    );
  }

  async function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      await cleanupDraftAttachments();
      resetEditor();
    }

    setOpen(nextOpen);
  }

  function openCreate() {
    resetEditor();
    setOpen(true);
  }

  async function resolveAttachmentUrls(baseAttachments: AttachmentValue[]) {
    const resolvedAttachments = await Promise.all(
      baseAttachments.map(async (attachment) => ({
        ...attachment,
        url:
          (await getAttachmentUrl({
            storageId: attachment.storageId,
          })) ?? undefined,
      })),
    );

    setAttachments((currentAttachments) =>
      sameAttachmentIds(currentAttachments, baseAttachments)
        ? resolvedAttachments
        : currentAttachments,
    );
  }

  async function openEdit(item: (typeof items)[number]) {
    const nextAttachments = (item.attachments ?? []).map((attachment) => ({
      ...attachment,
    }));

    setEditingId(item._id);
    setAttachments(nextAttachments);
    setInitialAttachmentIds(
      nextAttachments.map((attachment) => attachment.storageId),
    );
    form.reset({
      name: item.name,
      category: item.category,
      price: item.price,
      discount: item.discount ?? undefined,
      cashback: item.cashback ?? undefined,
      date: item.date,
      description: item.description ?? "",
      url: item.url ?? "",
      mileage: item.mileage ?? undefined,
      modification: item.modification ?? item.installed ?? undefined,
    });
    setOpen(true);
    await resolveAttachmentUrls(nextAttachments);
  }

  async function handleAttachmentUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setUploading(true);

    try {
      const uploadedAttachments = await Promise.all(
        files.map(async (file) => {
          const uploadUrl = await generateUploadUrl({});
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              "Content-Type": file.type || "application/octet-stream",
            },
            body: file,
          });

          if (!result.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const { storageId } = (await result.json()) as { storageId: string };
          const typedStorageId = storageId as Id<"_storage">;
          const url = await getAttachmentUrl({ storageId: typedStorageId });

          return {
            contentType: file.type || undefined,
            name: file.name,
            storageId: typedStorageId,
            url: url ?? undefined,
          };
        }),
      );

      setAttachments((currentAttachments) => [
        ...currentAttachments,
        ...uploadedAttachments,
      ]);
    } finally {
      setUploading(false);
    }
  }

  async function removeAttachmentFromDraft(storageId: Id<"_storage">) {
    const initialIds = new Set(initialAttachmentIds);
    const shouldDeleteNow = !initialIds.has(storageId);

    setAttachments((currentAttachments) =>
      currentAttachments.filter(
        (attachment) => attachment.storageId !== storageId,
      ),
    );

    if (shouldDeleteNow) {
      await deleteAttachment({ storageId });
    }
  }

  async function onSubmit(values: FormValues) {
    const nextAttachments = attachments.map(
      ({ contentType, name, storageId }) => ({
        contentType,
        name,
        storageId,
      }),
    );
    const data = {
      ...values,
      attachments: nextAttachments,
      description: values.description ?? undefined,
      url: values.url ?? undefined,
      discount: values.discount ?? undefined,
      cashback: values.cashback ?? undefined,
      mileage: values.mileage ?? undefined,
      modification: values.modification ?? undefined,
    };

    await (editingId
      ? updateItem({ id: editingId, ...data })
      : createItem(data));

    resetEditor();
    setOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Golf R</h1>
        <Dialog
          open={open}
          onOpenChange={async (nextOpen) => {
            await handleOpenChange(nextOpen);
          }}
        >
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
                        <Input placeholder="e.g. Oil Change" {...field} />
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
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="Optional"
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
                    name="modification"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <FormLabel>Modification</FormLabel>
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

                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">Attachments</p>
                      <p className="text-muted-foreground text-sm">
                        Upload receipts or warranty proof. Only visible in
                        admin.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        inputRef.current?.click();
                      }}
                    >
                      {uploading ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 size-4" />
                      )}
                      Add Files
                    </Button>
                  </div>

                  <Input
                    ref={inputRef}
                    multiple
                    type="file"
                    className="hidden"
                    onChange={async (event) => {
                      await handleAttachmentUpload(event);
                    }}
                  />

                  {attachments.length === 0 ? (
                    <div className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
                      No attachments yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.storageId}
                          className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                        >
                          <div className="min-w-0">
                            {attachment.url ? (
                              <a
                                className="hover:text-primary flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
                                href={attachment.url}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                <Paperclip className="size-4 shrink-0" />
                                <span className="truncate">
                                  {attachment.name}
                                </span>
                              </a>
                            ) : (
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Paperclip className="size-4 shrink-0" />
                                <span className="truncate">
                                  {attachment.name}
                                </span>
                              </div>
                            )}
                            {attachment.contentType ? (
                              <p className="text-muted-foreground text-xs">
                                {attachment.contentType}
                              </p>
                            ) : null}
                          </div>

                          <Button
                            size="icon"
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              void removeAttachmentFromDraft(
                                attachment.storageId,
                              );
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
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
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Disc/CB</TableHead>
            <TableHead className="text-right">Miles</TableHead>
            <TableHead className="text-right">Files</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-sm">
                {categories.find((c) => c.value === item.category)?.label ??
                  item.category}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {formatUsd(item.price)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-emerald-600">
                {(item.discount ?? 0) > 0 &&
                  `-${formatUsd(item.discount ?? 0)}`}
                {(item.cashback ?? 0) > 0 &&
                  `${(item.discount ?? 0) > 0 ? " / " : ""}-${formatUsd(item.cashback ?? 0)}`}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {item.mileage?.toLocaleString("en-US") ?? "—"}
              </TableCell>
              <TableCell className="text-right text-sm">
                <Badge variant="outline">{item.attachments?.length ?? 0}</Badge>
              </TableCell>
              <TableCell className="text-sm">{item.date}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      await openEdit(item);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      await deleteItem({ id: item._id });
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
