import type { FunctionReference } from "convex/server";
import { makeFunctionReference } from "convex/server";
import { ConvexError, v } from "convex/values";

import type { Id } from "../_generated/dataModel";
import { convex } from "../fluent";
import { escapeTelegramHtml, sendTelegramMessage } from "../lib/telegram";
import {
  assertValidBnbSessionToken,
  BNB_SESSION_TTL_MS,
  createBnbSessionToken,
  hashBnbSessionToken,
} from "./auth";

type BookingInput = {
  checkIn: string;
  checkOut: string;
  guests: string[];
  notes?: string;
};

type CreateBookingArgs = BookingInput & {
  now: number;
  sessionTokenHash: string;
};

const createBookingReference = makeFunctionReference(
  "bnb/mutations:createBooking"
) as unknown as FunctionReference<
  "mutation",
  "internal",
  CreateBookingArgs,
  Id<"bnbBookings">
>;

type PasswordVerificationResult =
  | { status: "rate_limited" }
  | { status: "valid" }
  | { status: "wrong" };

const authorizeSessionReference = makeFunctionReference(
  "bnb/auth:authorizeBnbSession"
) as unknown as FunctionReference<
  "mutation",
  "internal",
  { expiresAt: number; password: string; tokenHash: string },
  PasswordVerificationResult
>;

function assertBookingInput(args: BookingInput) {
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
  .handler(async (ctx, args) => {
    const sessionToken = createBnbSessionToken();
    const expiresAt = Date.now() + BNB_SESSION_TTL_MS;
    const tokenHash = await hashBnbSessionToken(sessionToken);
    const verification = await ctx.runMutation(authorizeSessionReference, {
      expiresAt,
      password: args.password,
      tokenHash,
    });

    if (verification.status === "rate_limited") {
      throw new ConvexError({
        code: "RATE_LIMITED",
        message: "Too many password attempts",
      });
    }

    if (verification.status === "wrong") {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Wrong password",
      });
    }

    return { expiresAt, sessionToken, success: true as const };
  })
  .public();

export const requestBooking = convex
  .action()
  .input({
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.array(v.string()),
    notes: v.optional(v.string()),
    sessionToken: v.string(),
  })
  .handler(async (ctx, args) => {
    assertValidBnbSessionToken(args.sessionToken);
    const sessionTokenHash = await hashBnbSessionToken(args.sessionToken);

    const booking = {
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      guests: args.guests.map((guest) => guest.trim()),
      notes: args.notes?.trim() || undefined,
    };
    assertBookingInput(booking);
    await ctx.runMutation(createBookingReference, {
      ...booking,
      now: Date.now(),
      sessionTokenHash,
    });

    const notesMessage = booking.notes
      ? `\n<b>Notes:</b>\n${escapeTelegramHtml(booking.notes)}`
      : "";
    const message = `<b>New Couch Booking Request</b>\n\n<b>Guests:</b> ${booking.guests.map(escapeTelegramHtml).join(", ")}\n<b>Check-in:</b> ${escapeTelegramHtml(booking.checkIn)}\n<b>Check-out:</b> ${escapeTelegramHtml(booking.checkOut)}${notesMessage}`;

    await sendTelegramMessage({ message });
    return { success: true as const };
  })
  .public();
