/* eslint-disable sort-keys */
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { CheckCircle2, Clock, Loader2, Plus, Sofa, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "convex/_generated/api";
import { checkBnbAuth, getBnbPassword, setBnbCookie } from "@/lib/bnb-auth";
import { appUrl } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/bnb/")({
  component: BnbPage,
  async beforeLoad() {
    const isAuthed = await checkBnbAuth();
    let cachedPassword: string | undefined;
    if (isAuthed) {
      try {
        cachedPassword = await getBnbPassword();
      } catch {}
    }

    return { cachedPassword, isAuthed };
  },
  head: () => ({
    links: [
      {
        href: `${appUrl}/bnb`,
        rel: "canonical",
      },
    ],
    meta: [
      {
        content: "Couch BnB | Manthan (@nahtnam)",
        title: "Couch BnB | Manthan (@nahtnam)",
      },
      {
        content: "Book Manthan's couch for your next stay.",
        name: "description",
      },
    ],
  }),
});

function BnbPage() {
  const { cachedPassword, isAuthed } = Route.useRouteContext();
  const [password, setPassword] = useState(cachedPassword ?? "");
  const [isUnlocked, setIsUnlocked] = useState(isAuthed);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const verifyPassword = useAction(api.bnb.actions.verifyPassword);

  useEffect(() => {
    if (!cachedPassword) {
      return;
    }

    const pw = cachedPassword;

    async function check() {
      try {
        await verifyPassword({ password: pw });
      } catch {
        setIsUnlocked(false);
        setPassword("");
      }
    }

    void check();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUnlock = useCallback(
    async (event: React.SyntheticEvent) => {
      event.preventDefault();
      setError(undefined);
      setIsVerifying(true);

      try {
        await verifyPassword({ password });
        await setBnbCookie({ data: { password } });
        setIsUnlocked(true);
      } catch {
        setError("Wrong password.");
      } finally {
        setIsVerifying(false);
      }
    },
    [password, verifyPassword],
  );

  return (
    <div className="page-shell page-shell-narrow">
      <div className="page-intro mb-8 text-center">
        <Sofa className="mx-auto mb-4 size-12" />
        <h1 className="font-serif text-5xl tracking-[-0.03em]">Couch BnB</h1>
        <p className="mt-3 text-muted-foreground">
          Book my couch for your next visit. Luxury not guaranteed.
        </p>
      </div>

      {isUnlocked ? (
        <>
          <BookingForm password={password} />
          <div className="mt-12">
            <h2 className="mb-4 font-semibold text-xl">Bookings</h2>
            <BookingsList />
          </div>
        </>
      ) : (
        <div className="section-card">
          <form className="space-y-4" onSubmit={handleUnlock}>
            <div className="space-y-2">
              <Label className="font-medium text-sm" htmlFor="password">
                Password
              </Label>
              <Input
                required
                disabled={isVerifying}
                id="password"
                placeholder="Enter the secret password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
            </div>

            {error ? <p className="text-destructive text-sm">{error}</p> : null}

            <Button
              className="w-full"
              disabled={isVerifying}
              size="lg"
              type="submit"
            >
              {isVerifying ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Enter"
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

function BookingForm(props: { readonly password: string }) {
  const { password } = props;
  const nextId = useRef(1);
  const [guests, setGuests] = useState([{ id: 0, name: "" }]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const requestBooking = useAction(api.bnb.actions.requestBooking);

  const handleSubmit = useCallback(
    async (event: React.SyntheticEvent) => {
      event.preventDefault();
      setError(undefined);

      const filledGuests = guests.map((g) => g.name.trim()).filter(Boolean);
      if (filledGuests.length === 0) {
        setError("Add at least one guest.");
        return;
      }

      setIsSubmitting(true);

      try {
        await requestBooking({
          checkIn,
          checkOut,
          guests: filledGuests,
          notes: notes || undefined,
          password,
        });

        setIsSubmitted(true);
      } catch {
        setError("Something went wrong. Try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [guests, checkIn, checkOut, notes, password, requestBooking],
  );

  if (isSubmitted) {
    return (
      <div className="section-card">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <CheckCircle2 className="size-12 text-green-500" />
          <h3 className="font-semibold text-lg">Booking requested!</h3>
          <p className="text-muted-foreground text-sm">
            Manthan will review your request and accept it if the couch is
            available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-card">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label className="font-medium text-sm">Guests</Label>
          {guests.map((guest, index) => (
            <div key={guest.id} className="flex gap-2">
              <Input
                required
                disabled={isSubmitting}
                placeholder={index === 0 ? "Who's crashing?" : "Another guest"}
                type="text"
                value={guest.name}
                onChange={(event) => {
                  const updated = [...guests];
                  updated[index] = { ...guest, name: event.target.value };
                  setGuests(updated);
                }}
              />
              {guests.length > 1 ? (
                <Button
                  disabled={isSubmitting}
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setGuests(guests.filter((g) => g.id !== guest.id));
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>
          ))}
          <Button
            className="gap-1"
            disabled={isSubmitting}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => {
              setGuests([...guests, { id: nextId.current++, name: "" }]);
            }}
          >
            <Plus className="size-3" />
            Add guest
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="checkIn">
              Check-in
            </Label>
            <Input
              required
              disabled={isSubmitting}
              id="checkIn"
              type="date"
              value={checkIn}
              onChange={(event) => {
                setCheckIn(event.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="checkOut">
              Check-out
            </Label>
            <Input
              required
              disabled={isSubmitting}
              id="checkOut"
              type="date"
              value={checkOut}
              onChange={(event) => {
                setCheckOut(event.target.value);
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="notes">
            Notes (optional)
          </Label>
          <Textarea
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
            id="notes"
            placeholder="Any special requests? (pillow preferences, allergies to cats, etc.)"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
            }}
          />
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <Button
          className="w-full gap-2"
          disabled={isSubmitting}
          size="lg"
          type="submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Requesting...
            </>
          ) : (
            <>
              <Sofa className="size-4" />
              Request booking
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function BookingsList() {
  const { data } = useSuspenseQuery(
    convexQuery(api.bnb.queries.listBookings, {}),
  );

  const { accepted, pending } = data;

  if (accepted.length === 0 && pending.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm">
        No bookings yet. Be the first to claim the couch!
      </p>
    );
  }

  const allBookings = [
    ...accepted.map((b) => ({ ...b, isPending: false })),
    ...pending.map((b) => ({ ...b, isPending: true })),
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Guests</TableHead>
          <TableHead>Check-in</TableHead>
          <TableHead>Check-out</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allBookings.map((booking) => (
          <TableRow key={booking._id}>
            <TableCell className="font-medium">
              {booking.guests.join(", ")}
            </TableCell>
            <TableCell>{booking.checkIn}</TableCell>
            <TableCell>{booking.checkOut}</TableCell>
            <TableCell>
              {booking.isPending ? (
                <Badge variant="outline">
                  <Clock className="mr-1 size-3" />
                  Pending
                </Badge>
              ) : (
                <Badge variant="default">Confirmed</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
