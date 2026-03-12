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
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Plane,
  Tags,
} from "lucide-react";
import { checkAdminAuth, setAdminCookie } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";

const adminNav = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/experiences", icon: Briefcase, label: "Experiences" },
  { href: "/admin/companies", icon: Building2, label: "Companies" },
  { href: "/admin/education", icon: GraduationCap, label: "Education" },
  { href: "/admin/projects", icon: FolderOpen, label: "Projects" },
  { href: "/admin/blog", icon: FileText, label: "Blog Posts" },
  { href: "/admin/blog/categories", icon: Tags, label: "Categories" },
  { href: "/admin/travel", icon: Plane, label: "Travel" },
];

export const Route = createFileRoute("/admin")({
  async beforeLoad({ location }) {
    const parameters = new URLSearchParams(location.searchStr);
    const secret = parameters.get("secret");

    if (secret) {
      const ok = await setAdminCookie({ data: { secret } });
      if (ok) {
        throw redirect({ to: "/admin" });
      }
    }

    const isAuthed = await checkAdminAuth();
    if (!isAuthed) {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();
  const { pathname } = router.state.location;

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <aside className="w-56 shrink-0 border-r">
        <nav className="flex flex-col gap-1 p-3">
          {adminNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Button
                key={item.href}
                asChild
                className="justify-start"
                size="sm"
                variant={isActive ? "secondary" : "ghost"}
              >
                <Link to={item.href}>
                  <item.icon className="mr-2 size-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
