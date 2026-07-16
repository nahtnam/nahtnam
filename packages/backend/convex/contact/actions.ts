import { ConvexError, v } from "convex/values";

import { convex } from "../fluent";
import { featureEnv } from "../lib/env";
import { escapeTelegramHtml, sendTelegramMessage } from "../lib/telegram";

type ContactInput = {
  email: string;
  message: string;
  name: string;
};

function validateContactInput(input: ContactInput) {
  if (!input.name.trim() || input.name.length > 100) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Name must be between one and 100 characters",
    });
  }

  if (!/^\S+@\S+\.\S+$/u.test(input.email) || input.email.length > 320) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Enter a valid email address",
    });
  }

  if (!input.message.trim() || input.message.length > 3000) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Message must be between one and 3000 characters",
    });
  }
}

export const sendMessage = convex
  .action()
  .input({
    email: v.string(),
    message: v.string(),
    name: v.string(),
    turnstileToken: v.string(),
  })
  .handler(async (_ctx, args) => {
    validateContactInput(args);

    const captchaResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        body: JSON.stringify({
          response: args.turnstileToken,
          secret: featureEnv.TURNSTILE_SECRET_KEY,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }
    );
    const captchaResult = (await captchaResponse.json()) as {
      success: boolean;
    };

    if (!captchaResult.success) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: "Invalid captcha",
      });
    }

    const message =
      "<b>New Contact Form Submission</b>\n\n" +
      `<b>Name:</b> ${escapeTelegramHtml(args.name.trim())}\n` +
      `<b>Email:</b> ${escapeTelegramHtml(args.email.trim())}\n\n` +
      `<b>Message:</b>\n${escapeTelegramHtml(args.message.trim())}`;

    await sendTelegramMessage({ message });
    return { success: true as const };
  })
  .public();
