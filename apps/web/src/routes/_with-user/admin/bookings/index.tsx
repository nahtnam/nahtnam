import { api } from "@repo/backend/api";
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
import { useMutation } from "convex/react";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { AdminPageHeader } from "../-components/admin-page-header";

const listBookings = createConvexRouteQuery(api.admin.bnb.listBookings);
const statusClasses = {
  accepted: "badge badge-success badge-soft",
  pending: "badge badge-warning badge-soft",
  rejected: "badge badge-error badge-soft",
} as const;

export const Route = createFileRoute("/_with-user/admin/bookings/")({
  async loader({ context }) {
    await listBookings.prefetchQuery(context.queryClient);
  },
  component: BookingAdminPage,
});

function BookingAdminPage() {
  const { data: bookings } = listBookings.useSuspenseQuery();
  const acceptBooking = useMutation(api.admin.bnb.acceptBooking);
  const rejectBooking = useMutation(api.admin.bnb.rejectBooking);
  const [pendingId, setPendingId] = useState<string>();

  return (
    <div>
      <AdminPageHeader
        description="Review couch requests without opening the database dashboard."
        eyebrow="Couch BnB"
        title="Bookings"
      />

      {bookings.length === 0 ? (
        <div className="card card-dash bg-base-100">
          <div className="card-body items-center py-16 text-center">
            <h2 className="card-title">No booking requests</h2>
            <p className="muted">New requests will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>Guests</th>
                <th>Stay</th>
                <th>Notes</th>
                <th>Status</th>
                <th aria-label="Actions" className="text-right" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const isPending = pendingId === booking._id;

                return (
                  <tr key={booking._id}>
                    <td className="font-medium">{booking.guests.join(", ")}</td>
                    <td className="whitespace-nowrap">
                      {booking.checkIn} → {booking.checkOut}
                    </td>
                    <td className="max-w-xs whitespace-normal text-base-content/65">
                      {booking.notes || "—"}
                    </td>
                    <td>
                      <BookingStatus status={booking.status} />
                    </td>
                    <td aria-label="Booking actions">
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label={`Accept booking for ${booking.guests.join(", ")}`}
                          className="btn btn-success btn-soft btn-sm"
                          disabled={isPending || booking.status === "accepted"}
                          type="button"
                          onClick={async () => {
                            setPendingId(booking._id);
                            try {
                              await acceptBooking({ id: booking._id });
                            } finally {
                              setPendingId(undefined);
                            }
                          }}
                        >
                          {isPending ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            <CheckIcon className="size-3.5" />
                          )}
                          Accept
                        </button>
                        <button
                          aria-label={`Reject booking for ${booking.guests.join(", ")}`}
                          className="btn btn-error btn-soft btn-sm"
                          disabled={isPending || booking.status === "rejected"}
                          type="button"
                          onClick={async () => {
                            setPendingId(booking._id);
                            try {
                              await rejectBooking({ id: booking._id });
                            } finally {
                              setPendingId(undefined);
                            }
                          }}
                        >
                          <XIcon className="size-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type BookingStatusProps = {
  status: "accepted" | "pending" | "rejected";
};

function BookingStatus(props: BookingStatusProps) {
  const { status } = props;

  return <span className={statusClasses[status]}>{status}</span>;
}
