import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  Car,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Plane,
  Tags,
} from "lucide-react";
import { api } from "convex/_generated/api";
import { createConvexRouteQuery } from "convex-route-query";

type NavItem = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

const adminNav: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/experiences", icon: Briefcase, label: "Experiences" },
  { href: "/admin/companies", icon: Building2, label: "Companies" },
  { href: "/admin/education", icon: GraduationCap, label: "Education" },
  { href: "/admin/projects", icon: FolderOpen, label: "Projects" },
  { href: "/admin/blog", icon: FileText, label: "Blog Posts" },
  { href: "/admin/blog/categories", icon: Tags, label: "Categories" },
  { href: "/admin/travel", icon: Plane, label: "Travel" },
  { href: "/admin/golf-r", icon: Car, label: "Golf R" },
];

const isAuthorized = createConvexRouteQuery(api.admin.auth.isAuthorized);

export const Route = createFileRoute("/admin")({
  async beforeLoad({ context }) {
    if (!context.auth.user) {
      throw redirect({ href: "/sign-in?redirectTo=%2Fadmin" });
    }

    try {
      await isAuthorized.fetchQuery(context.queryClient);
    } catch {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();
  const { pathname } = router.state.location;

  return (
    <div className="mx-auto w-full max-w-7xl md:px-2">
      <div className="flex gap-0 md:gap-8">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 md:block">
          <AdminNav pathname={pathname} />
        </aside>

        <div className="min-w-0 flex-1 py-6 md:py-8">
          <div className="-mx-6 mb-4 flex gap-1 overflow-x-auto px-6 md:hidden">
            {adminNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground/70 hover:bg-accent"
                  }`}
                  to={item.href}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function AdminNav({ pathname }: { readonly pathname: string }) {
  return (
    <nav className="flex flex-col gap-1 py-6">
      <p className="mb-3 px-3 font-mono text-[0.62rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        Manage
      </p>
      {adminNav.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-primary/10 font-medium text-primary"
                : "text-foreground/70 hover:bg-accent hover:text-foreground"
            }`}
            to={item.href}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
