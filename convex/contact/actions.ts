import { v } from "convex/values";
import { action } from "../_generated/server";
import { convexEnv } from "../lib/config/env";

export const sendMessage = action({
  args: {
    email: v.string(),
    message: v.string(),
    name: v.string(),
    turnstileToken: v.string(),
  },
  async handler(_ctx, args) {
    const turnstileSecret = convexEnv.TURNSTILE_SECRET_KEY;
    const telegramBotToken = convexEnv.TELEGRAM_BOT_TOKEN;
    const telegramChatId = convexEnv.TELEGRAM_CHAT_ID;

    if (!turnstileSecret || !telegramBotToken || !telegramChatId) {
      throw new Error("Missing environment variables");
    }

    const captchaResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        body: JSON.stringify({
          response: args.turnstileToken,
          secret: turnstileSecret,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );

    const captchaResult = (await captchaResponse.json()) as {
      success: boolean;
    };
    if (!captchaResult.success) {
      throw new Error("Invalid captcha");
    }

    const escapeHtml = (string_: string) =>
      string_
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const message =
      "<b>New Contact Form Submission</b>\n\n" +
      `<b>Name:</b> ${escapeHtml(args.name)}\n` +
      `<b>Email:</b> ${escapeHtml(args.email)}\n\n` +
      `<b>Message:</b>\n${escapeHtml(args.message)}`;

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        body: JSON.stringify({
          chat_id: telegramChatId,
          parse_mode: "HTML",
          text: message,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );

    if (!telegramResponse.ok) {
      throw new Error("Failed to send message");
    }

    return { success: true };
  },
});
