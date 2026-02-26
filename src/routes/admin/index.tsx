import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  FileText,
  FolderOpen,
  GraduationCap,
  Plane,
  Tags,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
];

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-6 font-semibold text-2xl">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} to={section.href}>
            <Card className="transition-colors hover:border-foreground/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <section.icon className="size-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
