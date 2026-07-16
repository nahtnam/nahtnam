import type { FunctionReference } from "convex/server";
import { makeFunctionReference } from "convex/server";
import { ConvexError, v } from "convex/values";

import type { Id } from "../_generated/dataModel";
import { convex } from "../fluent";
import { requireBnbPassword } from "../lib/secrets";
import { escapeTelegramHtml, sendTelegramMessage } from "../lib/telegram";

type CreateBookingArgs = {
  checkIn: string;
  checkOut: string;
  guests: string[];
  notes?: string;
};

const createBookingReference = makeFunctionReference(
  "bnb/mutations:createBooking"
) as unknown as FunctionReference<
  "mutation",
  "internal",
  CreateBookingArgs,
  Id<"bnbBookings">
>;

function assertBookingInput(args: CreateBookingArgs) {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/u;

  if (!(datePattern.test(args.checkIn) && datePattern.test(args.checkOut))) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Check-in and check-out must be ISO dates",
    });
  }

  if (args.checkOut <= args.checkIn) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Check-out must be after check-in",
    });
  }

  if (args.guests.length === 0 || args.guests.length > 10) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Provide between one and ten guests",
    });
  }

  if (args.guests.some((guest) => !guest || guest.length > 100)) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Guest names must be between one and 100 characters",
    });
  }

  if (args.notes && args.notes.length > 2000) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Notes must be no more than 2000 characters",
    });
  }
}

export const verifyPassword = convex
  .action()
  .input({ password: v.string() })
  .handler((_ctx, args) => {
    requireBnbPassword(args.password);
    return Promise.resolve({ success: true as const });
  })
  .public();

export const requestBooking = convex
  .action()
  .input({
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.array(v.string()),
    notes: v.optional(v.string()),
    password: v.string(),
  })
  .handler(async (ctx, args) => {
    requireBnbPassword(args.password);

    const booking = {
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      guests: args.guests.map((guest) => guest.trim()),
      notes: args.notes?.trim() || undefined,
    };
    assertBookingInput(booking);
    await ctx.runMutation(createBookingReference, booking);

    const notesMessage = booking.notes
      ? `\n<b>Notes:</b>\n${escapeTelegramHtml(booking.notes)}`
      : "";
    const message = `<b>New Couch Booking Request</b>\n\n<b>Guests:</b> ${booking.guests.map(escapeTelegramHtml).join(", ")}\n<b>Check-in:</b> ${escapeTelegramHtml(booking.checkIn)}\n<b>Check-out:</b> ${escapeTelegramHtml(booking.checkOut)}${notesMessage}`;

    await sendTelegramMessage({ message });
    return { success: true as const };
  })
  .public();
