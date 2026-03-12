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
import { getAdminSecret } from "@/lib/admin-auth";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  companyId: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/experiences/")({
  component: ExperiencesAdmin,
});

function ExperiencesAdmin() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<
    Id<"resumeWorkExperiences"> | undefined
  >(undefined);

  const { data: experiences = [] } = useQuery(
    convexQuery(api.resume.queries.listExperiences, {}),
  );
  const { data: companies = [] } = useQuery(
    convexQuery(api.resume.queries.listCompanies, {}),
  );

  const { mutateAsync: createExperience } = useMutation({
    mutationFn: useConvexMutation(api.resume.mutations.createExperience),
  });
  const { mutateAsync: updateExperience } = useMutation({
    mutationFn: useConvexMutation(api.resume.mutations.updateExperience),
  });
  const { mutateAsync: deleteExperience } = useMutation({
    mutationFn: useConvexMutation(api.resume.mutations.deleteExperience),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  function openCreate() {
    setEditingId(undefined);
    form.reset({
      companyId: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setOpen(true);
  }

  function openEdit(exp: (typeof experiences)[number]) {
    setEditingId(exp._id);
    form.reset({
      companyId: exp.companyId,
      title: exp.title,
      location: exp.location,
      startDate: new Date(exp.startDate).toISOString().split("T")[0],
      endDate: exp.endDate
        ? new Date(exp.endDate).toISOString().split("T")[0]
        : "",
      description: exp.description ?? "",
    });
    setOpen(true);
  }

  async function onSubmit(values: FormValues) {
    const adminSecret = await getAdminSecret();
    const data = {
      companyId: values.companyId as Id<"resumeCompanies">,
      title: values.title,
      location: values.location,
      startDate: new Date(values.startDate).getTime(),
      endDate: values.endDate ? new Date(values.endDate).getTime() : undefined,
      description: values.description ?? undefined,
    };

    await (editingId
      ? updateExperience({ adminSecret, id: editingId, ...data })
      : createExperience({ adminSecret, ...data }));

    setOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Experiences</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1 size-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit" : "Create"} Experience
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((c) => (
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
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
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {experiences.map((exp) => (
            <TableRow key={exp._id}>
              <TableCell className="font-medium">{exp.title}</TableCell>
              <TableCell>{exp.company.name}</TableCell>
              <TableCell>{exp.location}</TableCell>
              <TableCell>
                {new Date(exp.startDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {exp.endDate
                  ? new Date(exp.endDate).toLocaleDateString()
                  : "Present"}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      openEdit(exp);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      const adminSecret = await getAdminSecret();
                      await deleteExperience({ adminSecret, id: exp._id });
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
