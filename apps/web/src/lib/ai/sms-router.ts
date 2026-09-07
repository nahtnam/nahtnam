import { isAiCommand } from "@repo/backend/ai-command";

export async function routeIncomingText(options: {
  body: string;
  receive: () => Promise<{ handled: boolean; reply?: string }>;
  print: () => Promise<{ status: string }>;
}) {
  const { body, receive, print } = options;
  const result = await receive();
  if (result.handled) {
    return { message: result.reply };
  }
  // Only an explicitly non-owner sender can use public text-to-print.
  // Legacy command-like messages remain private even from those senders.
  if (isAiCommand(body)) {
    return {};
  }
  const job = await print();
  return { message: job.status === "queued" ? "QUEUED" : undefined };
}
