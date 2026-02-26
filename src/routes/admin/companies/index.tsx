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
import { useAdminSecret } from "../route";
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
  websiteUrl: z.url("Must be a valid URL"),
  logoUrl: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/companies/")({
  component: CompaniesAdmin,
});

function CompaniesAdmin() {
  const adminSecret = useAdminSecret();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"resumeCompanies"> | undefined>(
    undefined,
  );

  const { data: companies = [] } = useQuery(
    convexQuery(api.resume.queries.listCompanies, {}),
  );

  const { mutateAsync: createCompany } = useMutation({
    mutationFn: useConvexMutation(api.resume.mutations.createCompany),
  });
  const { mutateAsync: updateCompany } = useMutation({
    mutationFn: useConvexMutation(api.resume.mutations.updateCompany),
  });
  const { mutateAsync: deleteCompany } = useMutation({
    mutationFn: useConvexMutation(api.resume.mutations.deleteCompany),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", websiteUrl: "", logoUrl: "" },
  });

  function openCreate() {
    setEditingId(undefined);
    form.reset({ name: "", websiteUrl: "", logoUrl: "" });
    setOpen(true);
  }

  function openEdit(company: (typeof companies)[number]) {
    setEditingId(company._id);
    form.reset({
      name: company.name,
      websiteUrl: company.websiteUrl,
      logoUrl: company.logoUrl,
    });
    setOpen(true);
  }

  async function onSubmit(values: FormValues) {
    await (editingId
      ? updateCompany({ adminSecret, id: editingId, ...values })
      : createCompany({ adminSecret, ...values }));

    setOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Companies</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1 size-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Create"} Company</DialogTitle>
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
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input type="url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Logo</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company._id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell className="max-w-48 truncate">
                {company.websiteUrl}
              </TableCell>
              <TableCell className="max-w-48 truncate">
                {company.logoUrl}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      openEdit(company);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      void deleteCompany({ adminSecret, id: company._id });
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
