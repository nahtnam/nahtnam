import { ORPCError, os } from "@orpc/server";
import escapeHtml from "escape-html";
import { Bot } from "grammy";
import { TurnstileVerify } from "turnstile-verify";
import { Result } from "within-ts";
import { z } from "zod";
import { serverEnv } from "@/config/env/server";

const inputSchema = z.object({
  email: z.string().email().max(254),
  message: z.string().min(1).max(5000),
  name: z.string().min(1).max(100),
  turnstileToken: z.string().min(1),
});

const turnstile = new TurnstileVerify({
  token: serverEnv.TURNSTILE_SECRET_KEY,
});
const bot = new Bot(serverEnv.TELEGRAM_BOT_TOKEN);

export const sendMessage = os.input(inputSchema).handler(async ({ input }) => {
  const captchaResult = await Result.tryPromise(() =>
    turnstile.validate({
      response: input.turnstileToken,
    })
  );
  if (!(captchaResult.ok && captchaResult.value.valid)) {
    throw new ORPCError("BAD_REQUEST", { message: "Invalid captcha" });
  }

  const message =
    "<b>New Contact Form Submission</b>\n\n" +
    `<b>Name:</b> ${escapeHtml(input.name)}\n` +
    `<b>Email:</b> ${escapeHtml(input.email)}\n\n` +
    `<b>Message:</b>\n${escapeHtml(input.message)}`;

  const sendResult = await Result.tryPromise(() =>
    bot.api.sendMessage(serverEnv.TELEGRAM_CHAT_ID, message, {
      parse_mode: "HTML",
    })
  );
  if (!sendResult.ok) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to send message",
    });
  }

  return { success: true };
});
