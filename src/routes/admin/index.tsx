import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Car,
  FileText,
  FolderOpen,
  GraduationCap,
  Plane,
  Tags,
} from "lucide-react";

const sections = [
  {
    description: "Manage work history",
    href: "/admin/experiences",
    icon: Briefcase,
    title: "Experiences",
  },
  {
    description: "Manage companies",
    href: "/admin/companies",
    icon: Building2,
    title: "Companies",
  },
  {
    description: "Manage education",
    href: "/admin/education",
    icon: GraduationCap,
    title: "Education",
  },
  {
    description: "Manage projects",
    href: "/admin/projects",
    icon: FolderOpen,
    title: "Projects",
  },
  {
    description: "Manage blog posts",
    href: "/admin/blog",
    icon: FileText,
    title: "Blog Posts",
  },
  {
    description: "Manage blog categories",
    href: "/admin/blog/categories",
    icon: Tags,
    title: "Categories",
  },
  {
    description: "Import flight data",
    href: "/admin/travel",
    icon: Plane,
    title: "Travel",
  },
  {
    description: "Manage Golf R mods & costs",
    href: "/admin/golf-r",
    icon: Car,
    title: "Golf R",
  },
];

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl tracking-[-0.03em]">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Manage the content across your site.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              to={section.href}
            >
              <div className="rounded-lg border border-border bg-background p-2.5 text-muted-foreground transition-colors group-hover:text-primary">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold tracking-tight">
                    {section.title}
                  </h2>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
