import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { convexEnv } from "../lib/config/env";

export const verifyPassword = action({
  args: {
    password: v.string(),
  },
  async handler(_ctx, args) {
    if (args.password !== convexEnv.BNB_PASSWORD) {
      throw new Error("Wrong password");
    }

    return { success: true };
  },
});

export const requestBooking = action({
  args: {
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.array(v.string()),
    notes: v.optional(v.string()),
    password: v.string(),
  },
  async handler(ctx, args) {
    if (args.password !== convexEnv.BNB_PASSWORD) {
      throw new Error("Wrong password");
    }

    const { password: _, ...bookingData } = args;

    await ctx.runMutation(internal.bnb.mutations.createBooking, bookingData);

    const escapeHtml = (string_: string) =>
      string_
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const message =
      "<b>New Couch Booking Request</b>\n\n" +
      `<b>Guests:</b> ${args.guests.map((g) => escapeHtml(g)).join(", ")}\n` +
      `<b>Check-in:</b> ${escapeHtml(args.checkIn)}\n` +
      `<b>Check-out:</b> ${escapeHtml(args.checkOut)}\n` +
      (args.notes ? `\n<b>Notes:</b>\n${escapeHtml(args.notes)}` : "");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${convexEnv.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        body: JSON.stringify({
          chat_id: convexEnv.TELEGRAM_CHAT_ID,
          parse_mode: "HTML",
          text: message,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );

    if (!telegramResponse.ok) {
      throw new Error("Failed to send notification");
    }

    return { success: true };
  },
});
