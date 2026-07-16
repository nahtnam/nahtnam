import { createForm } from "@formadapter/react";
import { api } from "@repo/backend/api";
import type { Doc, Id } from "@repo/backend/data-model";
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
import { useMutation } from "convex/react";
import {
  BriefcaseBusinessIcon,
  Building2Icon,
  FolderKanbanIcon,
  GraduationCapIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import type { ComponentType } from "react";
import { z } from "zod";

import { AdminDialog } from "../-components/admin-dialog";
import { AdminPageHeader } from "../-components/admin-page-header";

type ResumeSection = "companies" | "education" | "experience" | "projects";

type Experience = Doc<"resumeWorkExperiences"> & {
  company: Doc<"resumeCompanies">;
};

type Editor =
  | { item?: Doc<"resumeCompanies">; kind: "company" }
  | { item?: Doc<"resumeEducation">; kind: "education" }
  | { item?: Experience; kind: "experience" }
  | { item?: Doc<"resumeProjects">; kind: "project" };

const companySchema = z.object({
  logoUrl: z.string().trim().min(1, "Enter a logo URL."),
  name: z.string().trim().min(1, "Enter a company name."),
  websiteUrl: z.url("Enter a valid website URL."),
});

const CompanyForm = createForm(companySchema).configure({
  fields: {
    logoUrl: {
      description: "A public image URL used by the experience timeline.",
      label: "Logo URL",
      placeholder: "https://…",
    },
    name: { label: "Company name" },
    websiteUrl: {
      control: "url",
      label: "Website",
      placeholder: "https://…",
    },
  },
});

const experienceSchema = z
  .object({
    companyId: z.string().min(1, "Choose a company."),
    description: z.string().trim().optional(),
    endDate: z.string().optional(),
    location: z.string().trim().min(1, "Enter a location."),
    startDate: z.string().min(1, "Choose a start date."),
    title: z.string().trim().min(1, "Enter a title."),
  })
  .refine(
    (experience) =>
      !experience.endDate || experience.endDate >= experience.startDate,
    {
      message: "The end date must be after the start date.",
      path: ["endDate"],
    }
  );

const ExperienceForm = createForm(experienceSchema).configure({
  fields: {
    companyId: { control: "select", label: "Company" },
    description: {
      control: "textarea",
      label: "Description (optional)",
      placeholder: "What changed because you were there?",
    },
    endDate: { control: "date", label: "End date (optional)" },
    location: { label: "Location" },
    startDate: { control: "date", label: "Start date" },
    title: { label: "Role" },
  },
});

const educationSchema = z.object({
  degree: z.string().trim().min(1, "Enter a degree."),
  details: z.string().trim().optional(),
  endYear: z.string().trim().min(1, "Enter an end year."),
  school: z.string().trim().min(1, "Enter a school."),
  startYear: z.string().trim().min(1, "Enter a start year."),
});

const EducationForm = createForm(educationSchema).configure({
  fields: {
    degree: { label: "Degree" },
    details: { control: "textarea", label: "Details (optional)" },
    endYear: { label: "End year" },
    school: { label: "School" },
    startYear: { label: "Start year" },
  },
});

const projectSchema = z.object({
  description: z.string().trim().min(1, "Enter a description."),
  link: z.url("Enter a valid project URL."),
  name: z.string().trim().min(1, "Enter a project name."),
  tags: z.string().trim().min(1, "Enter at least one tag."),
});

const ProjectForm = createForm(projectSchema).configure({
  fields: {
    description: { control: "textarea", label: "Description" },
    link: {
      control: "url",
      label: "Project URL",
      placeholder: "https://…",
    },
    name: { label: "Project name" },
    tags: {
      description: "Separate tags with commas.",
      label: "Tags",
      placeholder: "TypeScript, React, Convex",
    },
  },
});

const listCompanies = createConvexRouteQuery(api.admin.resume.listCompanies);
const listEducation = createConvexRouteQuery(api.admin.resume.listEducation);
const listExperiences = createConvexRouteQuery(
  api.admin.resume.listExperiences
);
const listProjects = createConvexRouteQuery(api.admin.resume.listProjects);

export const Route = createFileRoute("/_with-user/admin/resume/")({
  validateSearch: z.object({
    section: z
      .enum(["companies", "education", "experience", "projects"])
      .optional(),
  }),
  async loader({ context }) {
    await Promise.all([
      listCompanies.prefetchQuery(context.queryClient),
      listEducation.prefetchQuery(context.queryClient),
      listExperiences.prefetchQuery(context.queryClient),
      listProjects.prefetchQuery(context.queryClient),
    ]);
  },
  component: ResumeAdminPage,
});

const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const sectionMeta: {
  icon: ComponentType<{ className?: string }>;
  id: ResumeSection;
  label: string;
}[] = [
  { icon: BriefcaseBusinessIcon, id: "experience", label: "Experience" },
  { icon: Building2Icon, id: "companies", label: "Companies" },
  { icon: GraduationCapIcon, id: "education", label: "Education" },
  { icon: FolderKanbanIcon, id: "projects", label: "Projects" },
];

function ResumeAdminPage() {
  const search = Route.useSearch();
  const { data: companies } = listCompanies.useSuspenseQuery();
  const { data: education } = listEducation.useSuspenseQuery();
  const { data: experiences } = listExperiences.useSuspenseQuery();
  const { data: projects } = listProjects.useSuspenseQuery();
  const [editor, setEditor] = useState<Editor>();
  const [section, setSection] = useState<ResumeSection>(
    search.section ?? "experience"
  );

  const counts: Record<ResumeSection, number> = {
    companies: companies.length,
    education: education.length,
    experience: experiences.length,
    projects: projects.length,
  };

  return (
    <div>
      <AdminPageHeader
        description="Maintain the structured work history that powers the experience page and generated resume variants."
        eyebrow="Career record"
        title="Resume"
      />

      <div className="tabs tabs-box mb-6 w-fit" role="tablist">
        {sectionMeta.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={`tab gap-2 ${section === item.id ? "tab-active" : ""}`}
              role="tab"
              type="button"
              onClick={() => setSection(item.id)}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="badge badge-sm badge-ghost">
                {counts[item.id]}
              </span>
            </button>
          );
        })}
      </div>

      {section === "experience" ? (
        <ExperienceSection
          experiences={experiences}
          onCreate={() => setEditor({ kind: "experience" })}
          onEdit={(item) => setEditor({ item, kind: "experience" })}
        />
      ) : null}
      {section === "companies" ? (
        <CompanySection
          companies={companies}
          onCreate={() => setEditor({ kind: "company" })}
          onEdit={(item) => setEditor({ item, kind: "company" })}
        />
      ) : null}
      {section === "education" ? (
        <EducationSection
          education={education}
          onCreate={() => setEditor({ kind: "education" })}
          onEdit={(item) => setEditor({ item, kind: "education" })}
        />
      ) : null}
      {section === "projects" ? (
        <ProjectSection
          projects={projects}
          onCreate={() => setEditor({ kind: "project" })}
          onEdit={(item) => setEditor({ item, kind: "project" })}
        />
      ) : null}

      <AdminDialog
        description={editor ? editorDescription(editor.kind) : undefined}
        isOpen={Boolean(editor)}
        title={editor ? editorTitle(editor) : "Edit resume"}
        onClose={() => setEditor(undefined)}
      >
        {editor?.kind === "company" ? (
          <CompanyEditor
            company={editor.item}
            onDone={() => setEditor(undefined)}
          />
        ) : null}
        {editor?.kind === "education" ? (
          <EducationEditor
            education={editor.item}
            onDone={() => setEditor(undefined)}
          />
        ) : null}
        {editor?.kind === "experience" ? (
          <ExperienceEditor
            companies={companies}
            experience={editor.item}
            onDone={() => setEditor(undefined)}
          />
        ) : null}
        {editor?.kind === "project" ? (
          <ProjectEditor
            project={editor.item}
            onDone={() => setEditor(undefined)}
          />
        ) : null}
      </AdminDialog>
    </div>
  );
}

function editorDescription(kind: Editor["kind"]) {
  if (kind === "company") {
    return "Companies are shared by one or more work-history entries.";
  }
  if (kind === "experience") {
    return "Dates are stored as UTC timestamps and shown chronologically.";
  }
  if (kind === "education") {
    return "Education appears after your work history.";
  }
  return "Projects appear as highlights on the experience page.";
}

function editorTitle(editor: Editor) {
  const action = editor.item ? "Edit" : "Add";
  const label = editor.kind === "project" ? "project" : editor.kind;
  return `${action} ${label}`;
}

type SectionHeaderProps = {
  description: string;
  label: string;
  onCreate: () => void;
};

function SectionHeader(props: SectionHeaderProps) {
  const { description, label, onCreate } = props;

  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
      <p className="muted max-w-2xl">{description}</p>
      <button className="btn btn-sm" type="button" onClick={onCreate}>
        <PlusIcon className="size-4" /> Add {label}
      </button>
    </div>
  );
}

type RowActionsProps = {
  label: string;
  onDelete: () => Promise<unknown>;
  onEdit: () => void;
};

function RowActions(props: RowActionsProps) {
  const { label, onDelete, onEdit } = props;
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="flex justify-end gap-1">
        <button
          className="btn btn-ghost btn-xs"
          type="button"
          onClick={() => setIsConfirming(false)}
        >
          Cancel
        </button>
        <button
          className="btn btn-error btn-soft btn-xs"
          type="button"
          onClick={async () => {
            await onDelete();
            setIsConfirming(false);
          }}
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-1">
      <button
        aria-label={`Edit ${label}`}
        className="btn btn-ghost btn-square btn-sm"
        type="button"
        onClick={onEdit}
      >
        <PencilIcon className="size-4" />
      </button>
      <button
        aria-label={`Delete ${label}`}
        className="btn btn-ghost btn-square btn-sm text-error"
        type="button"
        onClick={() => setIsConfirming(true)}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

type ExperienceSectionProps = {
  experiences: Experience[];
  onCreate: () => void;
  onEdit: (item: Experience) => void;
};

function ExperienceSection(props: ExperienceSectionProps) {
  const { experiences, onCreate, onEdit } = props;
  const deleteExperience = useMutation(api.admin.resume.deleteExperience);

  return (
    <section>
      <SectionHeader
        description="Roles shown on the public experience timeline, newest first."
        label="role"
        onCreate={onCreate}
      />
      <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>Location</th>
              <th>Dates</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {experiences.map((experience) => (
              <tr key={experience._id}>
                <td className="font-medium">{experience.title}</td>
                <td>{experience.company.name}</td>
                <td>{experience.location}</td>
                <td className="whitespace-nowrap font-mono text-xs">
                  {formatDate(experience.startDate)} –{" "}
                  {experience.endDate ? formatDate(experience.endDate) : "Now"}
                </td>
                <td>
                  <RowActions
                    label={`${experience.title} at ${experience.company.name}`}
                    onDelete={() => deleteExperience({ id: experience._id })}
                    onEdit={() => onEdit(experience)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type CompanySectionProps = {
  companies: Doc<"resumeCompanies">[];
  onCreate: () => void;
  onEdit: (item: Doc<"resumeCompanies">) => void;
};

function CompanySection(props: CompanySectionProps) {
  const { companies, onCreate, onEdit } = props;
  const deleteCompany = useMutation(api.admin.resume.deleteCompany);

  return (
    <section>
      <SectionHeader
        description="Canonical company records reused by work-history entries."
        label="company"
        onCreate={onCreate}
      />
      <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Website</th>
              <th>Logo</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company._id}>
                <td className="font-medium">{company.name}</td>
                <td>
                  <a
                    className="link link-hover"
                    href={company.websiteUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {company.websiteUrl}
                  </a>
                </td>
                <td className="max-w-64 truncate font-mono text-xs">
                  {company.logoUrl}
                </td>
                <td>
                  <RowActions
                    label={company.name}
                    onDelete={() => deleteCompany({ id: company._id })}
                    onEdit={() => onEdit(company)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type EducationSectionProps = {
  education: Doc<"resumeEducation">[];
  onCreate: () => void;
  onEdit: (item: Doc<"resumeEducation">) => void;
};

function EducationSection(props: EducationSectionProps) {
  const { education, onCreate, onEdit } = props;
  const deleteEducation = useMutation(api.admin.resume.deleteEducation);

  return (
    <section>
      <SectionHeader
        description="Schools and degrees listed beneath the experience timeline."
        label="education"
        onCreate={onCreate}
      />
      <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>School</th>
              <th>Degree</th>
              <th>Years</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {education.map((item) => (
              <tr key={item._id}>
                <td className="font-medium">{item.school}</td>
                <td>{item.degree}</td>
                <td className="font-mono text-xs">
                  {item.startYear}–{item.endYear}
                </td>
                <td>
                  <RowActions
                    label={`${item.degree} at ${item.school}`}
                    onDelete={() => deleteEducation({ id: item._id })}
                    onEdit={() => onEdit(item)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type ProjectSectionProps = {
  onCreate: () => void;
  onEdit: (item: Doc<"resumeProjects">) => void;
  projects: Doc<"resumeProjects">[];
};

function ProjectSection(props: ProjectSectionProps) {
  const { onCreate, onEdit, projects } = props;
  const deleteProject = useMutation(api.admin.resume.deleteProject);

  return (
    <section>
      <SectionHeader
        description="Selected builds and side projects surfaced on the experience page."
        label="project"
        onCreate={onCreate}
      />
      <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Description</th>
              <th>Tags</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project._id}>
                <td className="font-medium">
                  <a
                    className="link link-hover"
                    href={project.link}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {project.name}
                  </a>
                </td>
                <td className="max-w-md">{project.description}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <span key={tag} className="badge badge-ghost badge-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <RowActions
                    label={project.name}
                    onDelete={() => deleteProject({ id: project._id })}
                    onEdit={() => onEdit(project)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type EditorDoneProps = { onDone: () => void };

function CompanyEditor(
  props: EditorDoneProps & { company?: Doc<"resumeCompanies"> }
) {
  const { company, onDone } = props;
  const createCompany = useMutation(api.admin.resume.createCompany);
  const updateCompany = useMutation(api.admin.resume.updateCompany);

  return (
    <CompanyForm.Form
      defaultValues={{
        logoUrl: company?.logoUrl ?? "",
        name: company?.name ?? "",
        websiteUrl: company?.websiteUrl ?? "",
      }}
      submitLabel={company ? "Save company" : "Add company"}
      onSubmit={async (values) => {
        try {
          await (company
            ? updateCompany({ id: company._id, ...values })
            : createCompany(values));
          onDone();
          return { status: "success" as const };
        } catch (error) {
          return formError(error);
        }
      }}
    />
  );
}

function ExperienceEditor(
  props: EditorDoneProps & {
    companies: Doc<"resumeCompanies">[];
    experience?: Experience;
  }
) {
  const { companies, experience, onDone } = props;
  const createExperience = useMutation(api.admin.resume.createExperience);
  const updateExperience = useMutation(api.admin.resume.updateExperience);

  return (
    <ExperienceForm.Form
      defaultValues={{
        companyId: experience?.companyId ?? "",
        description: experience?.description ?? "",
        endDate: experience?.endDate ? dateInputValue(experience.endDate) : "",
        location: experience?.location ?? "",
        startDate: experience ? dateInputValue(experience.startDate) : "",
        title: experience?.title ?? "",
      }}
      submitLabel={experience ? "Save role" : "Add role"}
      onSubmit={async (values) => {
        const data = {
          companyId: values.companyId as Id<"resumeCompanies">,
          description: values.description || undefined,
          endDate: values.endDate
            ? new Date(`${values.endDate}T00:00:00Z`).getTime()
            : undefined,
          location: values.location,
          startDate: new Date(`${values.startDate}T00:00:00Z`).getTime(),
          title: values.title,
        };

        try {
          await (experience
            ? updateExperience({ id: experience._id, ...data })
            : createExperience(data));
          onDone();
          return { status: "success" as const };
        } catch (error) {
          return formError(error);
        }
      }}
    >
      <ExperienceForm.Field
        name="companyId"
        options={companies.map((company) => ({
          label: company.name,
          value: company._id,
        }))}
      />
      <ExperienceForm.Fields
        names={["title", "location", "startDate", "endDate", "description"]}
      />
      <ExperienceForm.Submit />
    </ExperienceForm.Form>
  );
}

function EducationEditor(
  props: EditorDoneProps & { education?: Doc<"resumeEducation"> }
) {
  const { education, onDone } = props;
  const createEducation = useMutation(api.admin.resume.createEducation);
  const updateEducation = useMutation(api.admin.resume.updateEducation);

  return (
    <EducationForm.Form
      defaultValues={{
        degree: education?.degree ?? "",
        details: education?.details ?? "",
        endYear: education?.endYear ?? "",
        school: education?.school ?? "",
        startYear: education?.startYear ?? "",
      }}
      submitLabel={education ? "Save education" : "Add education"}
      onSubmit={async (values) => {
        const data = { ...values, details: values.details || undefined };
        try {
          await (education
            ? updateEducation({ id: education._id, ...data })
            : createEducation(data));
          onDone();
          return { status: "success" as const };
        } catch (error) {
          return formError(error);
        }
      }}
    />
  );
}

function ProjectEditor(
  props: EditorDoneProps & { project?: Doc<"resumeProjects"> }
) {
  const { onDone, project } = props;
  const createProject = useMutation(api.admin.resume.createProject);
  const updateProject = useMutation(api.admin.resume.updateProject);

  return (
    <ProjectForm.Form
      defaultValues={{
        description: project?.description ?? "",
        link: project?.link ?? "",
        name: project?.name ?? "",
        tags: project?.tags.join(", ") ?? "",
      }}
      submitLabel={project ? "Save project" : "Add project"}
      onSubmit={async (values) => {
        const data = {
          description: values.description,
          link: values.link,
          name: values.name,
          tags: parseTags(values.tags),
        };
        try {
          await (project
            ? updateProject({ id: project._id, ...data })
            : createProject(data));
          onDone();
          return { status: "success" as const };
        } catch (error) {
          return formError(error);
        }
      }}
    />
  );
}

function dateInputValue(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function parseTags(value: string) {
  const tags: string[] = [];

  for (const tag of value.split(",")) {
    const trimmedTag = tag.trim();
    if (trimmedTag) {
      tags.push(trimmedTag);
    }
  }

  return tags;
}

function formatDate(timestamp: number) {
  return monthYearFormatter.format(timestamp);
}

function formError(error: unknown) {
  return {
    errorKind: "business" as const,
    fieldErrors: {},
    formErrors: [
      error instanceof Error ? error.message : "The change could not be saved.",
    ],
    status: "error" as const,
  };
}
