/* oxlint-disable sonarjs/function-name -- TanStack names server handlers after HTTP methods. */
import { api } from "@repo/backend/api";
import { clientEnv } from "@repo/config/env/client";
import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";

import {
  clearBnbSessionCookie,
  getBnbSessionToken,
  isSameOriginRequest,
} from "@/lib/bnb/session.server";
import { isConvexErrorCode } from "@/lib/convex-error";

const bookingSchema = z
  .object({
    checkIn: z.iso.date(),
    checkOut: z.iso.date(),
    guests: z.array(z.string().trim().min(1).max(100)).min(1).max(10),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine((booking) => booking.checkOut > booking.checkIn, {
    message: "Check-out must be after check-in.",
    path: ["checkOut"],
  });

export const Route = createFileRoute("/api/bnb/bookings")({
  server: {
    handlers: {
      async GET({ request }) {
        const sessionToken = getBnbSessionToken(request);
        if (!sessionToken) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);
          const bookings = await convex.action(api.bnb.queries.listBookings, {
            sessionToken,
          });

          return Response.json(bookings, {
            headers: { "Cache-Control": "private, no-store" },
          });
        } catch (error) {
          if (isConvexErrorCode({ code: "UNAUTHORIZED", error })) {
            return Response.json(
              { error: "Unauthorized" },
              {
                headers: { "Set-Cookie": clearBnbSessionCookie() },
                status: 401,
              }
            );
          }

          return Response.json(
            { error: "Couch BnB is not configured." },
            { status: 503 }
          );
        }
      },
      async POST({ request }) {
        if (!isSameOriginRequest(request)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const sessionToken = getBnbSessionToken(request);
        if (!sessionToken) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await readJson(request);
        if (!body.success) {
          return Response.json(
            { error: "Request body must be valid JSON." },
            { status: 400 }
          );
        }

        const parsed = bookingSchema.safeParse(body.data);
        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid booking." },
            { status: 400 }
          );
        }

        try {
          const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);
          const notes = parsed.data.notes || undefined;
          const result = await convex.action(api.bnb.actions.requestBooking, {
            ...parsed.data,
            notes,
            sessionToken,
          });

          return Response.json(result, { status: 201 });
        } catch (error) {
          if (isConvexErrorCode({ code: "UNAUTHORIZED", error })) {
            return Response.json(
              { error: "Unauthorized" },
              {
                headers: { "Set-Cookie": clearBnbSessionCookie() },
                status: 401,
              }
            );
          }

          return Response.json(
            { error: "Something went wrong. Try again." },
            { status: 500 }
          );
        }
      },
    },
  },
});

async function readJson(request: Request) {
  try {
    return { data: (await request.json()) as unknown, success: true as const };
  } catch {
    return { success: false as const };
  }
}
