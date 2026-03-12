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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  school: z.string().min(1, "Required"),
  degree: z.string().min(1, "Required"),
  startYear: z.string().min(1, "Required"),
  endYear: z.string().min(1, "Required"),
  details: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/education/")({
  component: EducationAdmin,
});

function EducationAdmin() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"resumeEducation"> | undefined>(
    undefined,
  );

  const { data: education = [] } = useQuery(
    convexQuery(api.resume.queries.listEducation, {}),
  );

  const { mutateAsync: createEducation } = useMutation({
    mutationFn: useConvexMutation(api.resume.mutations.createEducation),
  });
  const { mutateAsync: updateEducation } = useMutation({
    mutationFn: useConvexMutation(api.resume.mutations.updateEducation),
  });
  const { mutateAsync: deleteEducation } = useMutation({
    mutationFn: useConvexMutation(api.resume.mutations.deleteEducation),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      school: "",
      degree: "",
      startYear: "",
      endYear: "",
      details: "",
    },
  });

  function openCreate() {
    setEditingId(undefined);
    form.reset({
      school: "",
      degree: "",
      startYear: "",
      endYear: "",
      details: "",
    });
    setOpen(true);
  }

  function openEdit(edu: (typeof education)[number]) {
    setEditingId(edu._id);
    form.reset({
      school: edu.school,
      degree: edu.degree,
      startYear: edu.startYear,
      endYear: edu.endYear,
      details: edu.details ?? "",
    });
    setOpen(true);
  }

  async function onSubmit(values: FormValues) {
    const adminSecret = await getAdminSecret();
    const data = {
      ...values,
      details: values.details ?? undefined,
    };

    await (editingId
      ? updateEducation({ adminSecret, id: editingId, ...data })
      : createEducation({ adminSecret, ...data }));

    setOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Education</h1>
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
                {editingId ? "Edit" : "Create"} Education
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree</FormLabel>
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
                    name="startYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Year</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Year</FormLabel>
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
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
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
            <TableHead>School</TableHead>
            <TableHead>Degree</TableHead>
            <TableHead>Years</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {education.map((edu) => (
            <TableRow key={edu._id}>
              <TableCell className="font-medium">{edu.school}</TableCell>
              <TableCell>{edu.degree}</TableCell>
              <TableCell>
                {edu.startYear} - {edu.endYear}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      openEdit(edu);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      const adminSecret = await getAdminSecret();
                      await deleteEducation({ adminSecret, id: edu._id });
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
