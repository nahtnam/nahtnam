import { featureEnv } from "./env";

type SendTelegramMessageOptions = {
  message: string;
};

export async function sendTelegramMessage(options: SendTelegramMessageOptions) {
  const { message } = options;
  const response = await fetch(
    `https://api.telegram.org/bot${featureEnv.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      body: JSON.stringify({
        chat_id: featureEnv.TELEGRAM_CHAT_ID,
        parse_mode: "HTML",
        text: message,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send Telegram notification");
  }
}

export function escapeTelegramHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
