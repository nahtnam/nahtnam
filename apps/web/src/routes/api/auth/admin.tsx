import { adminRole } from "@repo/config/auth";
import { serverEnv } from "@repo/config/env/server";
import { createFileRoute } from "@tanstack/react-router";
import { WorkOS } from "@workos-inc/node";
import {
  getAuth,
  getSignInUrl,
  switchToOrganization,
} from "@workos/authkit-tanstack-react-start";

const ADMIN_AUTH_ATTEMPT_COOKIE = "nahtnam-admin-auth-attempt";
const ADMIN_PATH = "/admin";
const HOME_PATH = "/";

const workos = new WorkOS(serverEnv.WORKOS_API_KEY);

type RedirectResponseOptions = {
  clearAttempt?: boolean;
  location: string;
  markAttempt?: boolean;
};

type RoleClaims = {
  role?: string;
  roles?: string[];
};

function hasAdminRole(claims: RoleClaims) {
  return (
    claims.role === adminRole || claims.roles?.includes(adminRole) === true
  );
}

function redirectResponse(options: RedirectResponseOptions) {
  const { clearAttempt = false, location, markAttempt = false } = options;
  const headers = new Headers({ Location: location });

  if (markAttempt) {
    headers.append(
      "Set-Cookie",
      `${ADMIN_AUTH_ATTEMPT_COOKIE}=1; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=120`
    );
  } else if (clearAttempt) {
    headers.append(
      "Set-Cookie",
      `${ADMIN_AUTH_ATTEMPT_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`
    );
  }

  return new Response(null, {
    headers,
    status: 307,
  });
}

function hasAdminAuthAttemptCookie(request: Request) {
  return request.headers
    .get("Cookie")
    ?.split(";")
    .some((cookie) => cookie.trim() === `${ADMIN_AUTH_ATTEMPT_COOKIE}=1`);
}

function getAdminSignInUrl() {
  return getSignInUrl({
    data: {
      returnPathname: ADMIN_PATH,
    },
  });
}

async function findAdminOrganizationId(userId: string) {
  const memberships = await workos.userManagement.listOrganizationMemberships({
    limit: 100,
    statuses: ["active"],
    userId,
  });
  const adminMembership = memberships.data.find((membership) => {
    const roleSlugs = new Set([
      membership.role.slug,
      ...(membership.roles?.map(({ slug }) => slug) ?? []),
    ]);

    return roleSlugs.has(adminRole);
  });

  return adminMembership?.organizationId ?? null;
}

export const Route = createFileRoute("/api/auth/admin")({
  server: {
    handlers: {
      // oxlint-disable-next-line sonarjs/function-name
      async GET({ request }) {
        const hasAttemptedAccountSelection =
          hasAdminAuthAttemptCookie(request) === true;
        const auth = await getAuth();

        if (!auth.user) {
          return redirectResponse({
            location: await getAdminSignInUrl(),
            markAttempt: true,
          });
        }

        if (hasAdminRole(auth)) {
          return redirectResponse({ clearAttempt: true, location: ADMIN_PATH });
        }

        const organizationId = await findAdminOrganizationId(auth.user.id);

        if (!organizationId) {
          return hasAttemptedAccountSelection
            ? redirectResponse({ clearAttempt: true, location: HOME_PATH })
            : redirectResponse({
                location: await getAdminSignInUrl(),
                markAttempt: true,
              });
        }

        const switchedAuth = await switchToOrganization({
          data: {
            organizationId,
          },
        });

        if (!hasAdminRole(switchedAuth)) {
          return redirectResponse({ clearAttempt: true, location: HOME_PATH });
        }

        return redirectResponse({ clearAttempt: true, location: ADMIN_PATH });
      },
    },
  },
});
