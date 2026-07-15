import { isNotFound, isRedirect } from "@tanstack/react-router";
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";
import { authkitMiddleware } from "@workos/authkit-tanstack-react-start";

import { applySecurityHeaders } from "@/lib/security/headers";

const securityHeadersMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const result = await next();

    return {
      ...result,
      response: applySecurityHeaders(result.response, request),
    };
  }
);

const csrfMiddleware = createCsrfMiddleware({
  filter: ({ handlerType }) => handlerType === "serverFn",
});

const exceptionMiddleware = createMiddleware().server(
  async ({ next, pathname, request }) => {
    try {
      return await next();
    } catch (error) {
      if (!isRedirect(error) && !isNotFound(error)) {
        try {
          const { captureServerException } =
            await import("@/lib/posthog/posthog.server");
          await captureServerException(error, {
            method: request.method,
            pathname,
          });
        } catch {
          // Reporting failures must not replace the application error.
        }
      }

      throw error;
    }
  }
);

export const startInstance = createStart(() => ({
  requestMiddleware: [
    securityHeadersMiddleware,
    csrfMiddleware,
    exceptionMiddleware,
    authkitMiddleware(),
  ],
}));
