import { api } from "@repo/backend/api";
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
import {
  BookOpenIcon,
  BriefcaseBusinessIcon,
  CarIcon,
  HouseIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PlaneIcon,
} from "lucide-react";
import type { ComponentType } from "react";

type AdminPath =
  | "/admin"
  | "/admin/bookings"
  | "/admin/golf-r"
  | "/admin/resume"
  | "/admin/travel"
  | "/admin/writing";

type AdminNavItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  to: AdminPath;
};

const adminNav: AdminNavItem[] = [
  { icon: LayoutDashboardIcon, label: "Overview", to: "/admin" },
  { icon: BriefcaseBusinessIcon, label: "Resume", to: "/admin/resume" },
  { icon: BookOpenIcon, label: "Writing", to: "/admin/writing" },
  { icon: PlaneIcon, label: "Travel", to: "/admin/travel" },
  { icon: CarIcon, label: "Golf R", to: "/admin/golf-r" },
  { icon: HouseIcon, label: "Bookings", to: "/admin/bookings" },
];

const isAuthorized = createConvexRouteQuery(api.admin.auth.isAuthorized);

export const Route = createFileRoute("/_with-user/admin")({
  async loader({ context }) {
    const authorized = await isAuthorized.fetchQuery(context.queryClient, {});

    if (!authorized) {
      throw redirect({
        href: "/api/auth/admin",
        reloadDocument: true,
      });
    }
  },
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Admin | Manthan (@nahtnam)" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});

function AdminLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className="drawer lg:drawer-open">
      <input className="drawer-toggle" id="admin-navigation" type="checkbox" />
      <div className="drawer-content min-w-0">
        <div className="border-b border-base-300 bg-base-100 px-5 py-3 lg:hidden">
          <label className="btn btn-ghost btn-sm" htmlFor="admin-navigation">
            <MenuIcon className="size-4" /> Manage site
          </label>
        </div>
        <main className="page-shell max-w-[96rem]">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side z-30 lg:z-0">
        <label
          aria-label="Close admin navigation"
          className="drawer-overlay"
          htmlFor="admin-navigation"
        />
        <aside className="min-h-full w-72 border-r border-base-300 bg-base-200 p-5 lg:w-64">
          <div className="mb-6 px-3">
            <p className="font-mono text-xs font-semibold tracking-[0.18em] text-base-content/50 uppercase">
              Site control
            </p>
            <p className="mt-1 text-lg font-semibold">nahtnam admin</p>
          </div>
          <ul className="menu w-full gap-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.to ||
                (item.to !== "/admin" && pathname.startsWith(item.to));

              return (
                <li key={item.to}>
                  <Link
                    className={isActive ? "menu-active" : undefined}
                    to={item.to}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 border-t border-base-300 px-3 pt-5">
            <Link className="link link-hover text-sm" to="/">
              View public site
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
