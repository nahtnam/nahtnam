import { ORPCError, os } from "@orpc/server";
import escapeHtml from "escape-html";
import { Bot } from "grammy";
import { TurnstileVerify } from "turnstile-verify";
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
  const { valid } = await turnstile.validate({
    response: input.turnstileToken,
  });
  if (!valid) {
    throw new ORPCError("BAD_REQUEST", { message: "Invalid captcha" });
  }

  const message =
    "<b>New Contact Form Submission</b>\n\n" +
    `<b>Name:</b> ${escapeHtml(input.name)}\n` +
    `<b>Email:</b> ${escapeHtml(input.email)}\n\n` +
    `<b>Message:</b>\n${escapeHtml(input.message)}`;

  await bot.api.sendMessage(serverEnv.TELEGRAM_CHAT_ID, message, {
    parse_mode: "HTML",
  });

  return { success: true };
});
