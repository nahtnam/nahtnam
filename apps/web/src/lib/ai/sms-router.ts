import { isAiCommand } from "@repo/backend/ai-command";

export async function routeIncomingText(options: {
  body: string;
  command: () => Promise<{ handled: boolean; reply?: string }>;
  print: () => Promise<{ status: string }>;
}) {
  const { body, command, print } = options;
  if (isAiCommand(body)) {
    const result = await command();
    // Unknown, unauthorized, or stale commands never fall through to paper.
    return { message: result.reply };
  }
  const job = await print();
  return { message: job.status === "queued" ? "QUEUED" : undefined };
}
