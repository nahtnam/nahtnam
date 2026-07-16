import { Input as DaisyInput, daisyUIAdapter } from "@formadapter/daisyui";
import { createForm, createFormFactory } from "@formadapter/react";
import type { ControlProps } from "@formadapter/react";
import type { Doc } from "@repo/backend/data-model";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDaysIcon, KeyRoundIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { createSeo, pageSeo } from "@/lib/seo";

type BookingGroups = {
  accepted: Doc<"bnbBookings">[];
  pending: Doc<"bnbBookings">[];
};

type AccessState = "authenticated" | "loading" | "signed-out";

const bookingsEndpoint = "/api/bnb/bookings";
const signedOutAccess = "signed-out" as const satisfies AccessState;
const bookingRefreshMilliseconds = 15_000;

const loginSchema = z.object({
  password: z.string().min(1, "Enter the secret password."),
});

const LoginForm = createForm(loginSchema).configure({
  fields: {
    password: {
      control: "password",
      label: "Password",
      placeholder: "Enter the secret password",
    },
  },
});

const bookingSchema = z
  .object({
    checkIn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u, "Choose a check-in date."),
    checkOut: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u, "Choose a check-out date."),
    guests: z
      .array(z.string().trim().min(1, "Enter a guest name."))
      .min(1, "Add at least one guest."),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine((booking) => booking.checkOut > booking.checkIn, {
    message: "Check-out must be after check-in.",
    path: ["checkOut"],
  });

const bookingAdapter = daisyUIAdapter.extend({
  controls: {
    custom: {
      guestName: GuestNameControl,
    },
  },
});
const createBookingForm = createFormFactory(bookingAdapter);
const BookingForm = createBookingForm(bookingSchema).configure({
  fields: {
    checkIn: { control: "date", label: "Check-in" },
    checkOut: { control: "date", label: "Check-out" },
    guests: {
      array: { addLabel: "Add guest", itemLabel: "Guest" },
      label: "Guests",
    },
    "guests[]": { control: "guestName", label: "Guest" },
    notes: {
      control: "textarea",
      label: "Notes (optional)",
      placeholder:
        "Any special requests? (pillow preferences, allergies to cats, etc.)",
    },
  },
});

export const Route = createFileRoute("/_public/bnb/")({
  component: CouchBnbPage,
  head: () => createSeo(pageSeo.bnb),
});

function CouchBnbPage() {
  const [access, setAccess] = useState<AccessState>("loading");
  const [bookings, setBookings] = useState<BookingGroups>({
    accepted: [],
    pending: [],
  });

  async function loadBookings() {
    const nextBookings = await fetchBookings();
    if (!nextBookings) {
      setAccess(signedOutAccess);
      return false;
    }

    setBookings(nextBookings);
    setAccess("authenticated");
    return true;
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const nextBookings = await fetchBookings();
        if (!active) {
          return;
        }

        if (nextBookings) {
          setBookings(nextBookings);
          setAccess("authenticated");
        } else {
          setAccess(signedOutAccess);
        }
      } catch {
        if (active) {
          setAccess(signedOutAccess);
        }
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (access !== "authenticated") {
      return;
    }

    let active = true;
    const interval = window.setInterval(() => {
      async function refresh() {
        try {
          const nextBookings = await fetchBookings();
          if (active && nextBookings) {
            setBookings(nextBookings);
          }
        } catch {
          // Keep the most recent successful snapshot during transient failures.
        }
      }

      void refresh();
    }, bookingRefreshMilliseconds);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [access]);

  return (
    <div className="page-shell page-shell-article public-bnb">
      <header className="mb-14 grid gap-6 border-b border-base-300 pb-10 sm:mb-16 sm:pb-12 md:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] md:items-end md:gap-12">
        <div>
          <span className="route-kicker">Novelty</span>
          <h1 className="heading mt-4 text-5xl sm:text-6xl">Couch BnB</h1>
        </div>
        <p className="text-pretty text-lg leading-8 text-base-content/70">
          Book my couch for your next visit. Luxury not guaranteed.
        </p>
      </header>

      {access === "loading" ? (
        <div className="grid min-h-56 place-items-center">
          <span className="loading loading-dots loading-lg" />
        </div>
      ) : null}
      {access === signedOutAccess ? (
        <LoginPanel loadBookings={loadBookings} />
      ) : null}
      {access === "authenticated" ? (
        <BookingWorkspace bookings={bookings} loadBookings={loadBookings} />
      ) : null}
    </div>
  );
}

type LoginPanelProps = {
  loadBookings: () => Promise<boolean>;
};

function LoginPanel(props: LoginPanelProps) {
  const { loadBookings } = props;

  return (
    <section className="border-t-2 border-base-content bg-base-200/55 px-6 py-8 sm:px-10 sm:py-10">
      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <KeyRoundIcon className="mt-1 size-6 shrink-0 text-accent" />
          <div>
            <h2 className="heading text-2xl">Friends only</h2>
            <p className="muted mt-1">
              Enter the shared password to see availability and request dates.
            </p>
          </div>
        </div>
        <LoginForm.Form
          submitLabel="Enter"
          onSubmit={async (values) => {
            const response = await fetch("/api/bnb/session", {
              body: JSON.stringify(values),
              headers: { "Content-Type": "application/json" },
              method: "POST",
            });

            if (!response.ok) {
              const body = (await response.json()) as { error?: string };
              return {
                errorKind: "business" as const,
                fieldErrors: {},
                formErrors: [body.error ?? "Wrong password."],
                status: "error" as const,
              };
            }

            await loadBookings();
            return { status: "success" as const };
          }}
        />
      </div>
    </section>
  );
}

type BookingWorkspaceProps = {
  bookings: BookingGroups;
  loadBookings: () => Promise<boolean>;
};

function BookingWorkspace(props: BookingWorkspaceProps) {
  const { bookings, loadBookings } = props;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const visibleBookings = [...bookings.accepted, ...bookings.pending].toSorted(
    (left, right) => left.checkIn.localeCompare(right.checkIn)
  );

  return (
    <div className="space-y-10">
      <section className="border-t-2 border-base-content bg-base-200/55 px-6 py-8 sm:px-10 sm:py-10">
        <div className="space-y-8">
          <div>
            <h2 className="heading text-3xl">Request the couch</h2>
            <p className="muted mt-1">
              Add everyone staying over and the dates you have in mind.
            </p>
          </div>
          {isSubmitted ? (
            <output className="alert alert-success">
              <CalendarDaysIcon className="size-5" />
              <div>
                <h3 className="font-semibold">Booking requested!</h3>
                <p>
                  Manthan will review your request and accept it if the couch is
                  available.
                </p>
              </div>
            </output>
          ) : (
            <BookingForm.Form
              defaultValues={{
                checkIn: "",
                checkOut: "",
                guests: [""],
                notes: "",
              }}
              submitLabel="Request booking"
              onSubmit={async (values) => {
                const response = await fetch(bookingsEndpoint, {
                  body: JSON.stringify(values),
                  headers: { "Content-Type": "application/json" },
                  method: "POST",
                });

                if (!response.ok) {
                  const body = (await response.json()) as { error?: string };
                  return {
                    errorKind: "business" as const,
                    fieldErrors: {},
                    formErrors: [
                      body.error ?? "Something went wrong. Try again.",
                    ],
                    status: "error" as const,
                  };
                }

                setIsSubmitted(true);
                await loadBookings();
                return {
                  message: "Booking requested!",
                  status: "success" as const,
                };
              }}
            >
              <BookingForm.Fields />
              <BookingSubmit />
            </BookingForm.Form>
          )}
        </div>
      </section>

      <section aria-labelledby="bookings-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <span className="route-kicker">Availability</span>
            <h2 className="heading mt-2 text-3xl" id="bookings-title">
              Bookings
            </h2>
          </div>
          <span className="badge badge-ghost">{visibleBookings.length}</span>
        </div>
        {visibleBookings.length === 0 ? (
          <div className="border-y border-dashed border-base-300 py-10 text-center">
            <p className="muted">
              No bookings yet. Be the first to claim the couch!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table">
              <thead>
                <tr>
                  <th>Guests</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.guests.join(", ")}</td>
                    <td>{booking.checkIn}</td>
                    <td>{booking.checkOut}</td>
                    <td>
                      <span
                        className={
                          booking.status === "accepted"
                            ? "badge badge-success badge-soft"
                            : "badge badge-warning badge-soft"
                        }
                      >
                        {booking.status === "accepted"
                          ? "Confirmed"
                          : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

async function fetchBookings() {
  const response = await fetch(bookingsEndpoint, {
    headers: { Accept: "application/json" },
  });

  if (response.status === 401) {
    return;
  }

  if (!response.ok) {
    throw new Error("Bookings could not be loaded.");
  }

  return (await response.json()) as BookingGroups;
}

function GuestNameControl(props: ControlProps) {
  const { field, name } = props;
  const isFirstGuest = name.endsWith(".0") || name.endsWith("[0]");

  return (
    <DaisyInput
      {...props}
      field={{
        ...field,
        config: {
          ...field.config,
          placeholder: isFirstGuest ? "Who's crashing?" : "Another guest",
        },
      }}
    />
  );
}

function BookingSubmit() {
  const { isSubmitting } = BookingForm.useFormState();

  return (
    <BookingForm.Submit>
      {isSubmitting ? "Requesting..." : "Request booking"}
    </BookingForm.Submit>
  );
}
