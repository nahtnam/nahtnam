import { api } from "@repo/backend/api";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";

import { adminSignInPath } from "@/lib/auth/admin-return";

import { ActionFeedbackProvider } from "./ai/-components/action-feedback";
import { PrivateAiPage } from "./ai/-components/private-page";

const isAuthorized = createConvexRouteQuery(api.admin.auth.isAuthorized);

export const Route = createFileRoute("/_with-user/ai")({
  async loader({ context, location }) {
    if (!(await isAuthorized.fetchQuery(context.queryClient, {}))) {
      throw redirect({
        href: adminSignInPath(location.pathname),
        reloadDocument: true,
      });
    }
  },
  component: AiLayout,
  errorComponent: () => (
    <PrivateAiPage className="py-16">
      <h1 className="heading text-3xl">Action center unavailable</h1>
      <p className="muted mt-4">
        Sign in with the administrator account that owns this action center. If
        you are already signed in as its owner, try again.
      </p>
      <a className="btn btn-primary mt-6" href={adminSignInPath("/ai")}>
        Check administrator access
      </a>
    </PrivateAiPage>
  ),
  head: () => ({
    meta: [
      { title: "Action center | nahtnam" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});

function AiLayout() {
  return (
    <PrivateAiPage className="py-8 sm:py-12">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="route-kicker">Private · yours to decide</p>
          <Link className="heading mt-2 block text-3xl sm:text-4xl" to="/ai">
            Action center
          </Link>
          <p className="muted mt-3">
            What matters now, with a way to close the loop.
          </p>
          <p className="mt-1 text-xs text-base-content/50">
            Dates and times shown in Pacific time.
          </p>
        </div>
        <Link className="link link-hover mt-1 text-sm" to="/admin">
          Admin
        </Link>
      </header>
      <ActionFeedbackProvider>
        <Outlet />
      </ActionFeedbackProvider>
    </PrivateAiPage>
  );
}
