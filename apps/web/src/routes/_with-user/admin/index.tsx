import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  BriefcaseBusinessIcon,
  CarIcon,
  HouseIcon,
  PlaneIcon,
} from "lucide-react";

import { AdminPageHeader } from "./-components/admin-page-header";

const sections = [
  {
    description: "Companies, roles, projects, and education",
    icon: BriefcaseBusinessIcon,
    title: "Resume",
    to: "/admin/resume" as const,
  },
  {
    description: "Posts, X threads, categories, and media",
    icon: BookOpenIcon,
    title: "Writing",
    to: "/admin/writing" as const,
  },
  {
    description: "Import and update your Flighty history",
    icon: PlaneIcon,
    title: "Travel",
    to: "/admin/travel" as const,
  },
  {
    description: "Build ledger, maintenance, and attachments",
    icon: CarIcon,
    title: "Golf R",
    to: "/admin/golf-r" as const,
  },
  {
    description: "Approve or reject couch requests",
    icon: HouseIcon,
    title: "Bookings",
    to: "/admin/bookings" as const,
  },
];

export const Route = createFileRoute("/_with-user/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div>
      <AdminPageHeader
        description="One calm place to maintain the content and private workflows behind the site."
        eyebrow="Control room"
        title="Overview"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link
              key={section.to}
              className="card card-border bg-base-100 transition hover:-translate-y-0.5 hover:border-base-content/25"
              to={section.to}
            >
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-box bg-base-200">
                    <Icon className="size-5" />
                  </span>
                  <ArrowUpRightIcon className="size-4 text-base-content/45" />
                </div>
                <h2 className="card-title mt-3">{section.title}</h2>
                <p className="muted">{section.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
