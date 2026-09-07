/* oxlint-disable sonarjs/function-name -- TanStack names handlers after HTTP methods. */
import { api } from "@repo/backend/api";
import type { Id } from "@repo/backend/data-model";
import { clientEnv } from "@repo/config/env/client";
import { serverEnv } from "@repo/config/env/server";
import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";

import { notifyUrgentItem } from "@/lib/ai/notify";
import { aiJson, authorizeAiRequest, readAiRequest } from "@/lib/ai/request";
import type { AiRequest } from "@/lib/ai/request";

async function dispatch(options: { input: AiRequest; secret: string }) {
  const { input, secret } = options;
  const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);
  switch (input.operation) {
    case "upsert": {
      return await convex.mutation(api.ai.ingest, {
        items: input.items,
        secret,
      });
    }
    case "publish": {
      return await convex.mutation(api.ai.publish, {
        expiresAt: input.expiresAt,
        idempotencyKey: input.idempotencyKey,
        mode: input.mode,
        secret,
        source: input.source,
        title: input.title,
      });
    }
    case "health": {
      return await convex.mutation(api.ai.recordHealth, {
        checkedAt: input.checkedAt,
        coverageThrough: input.coverageThrough,
        message: input.message,
        secret,
        source: input.source,
        status: input.status,
      });
    }
    case "notify": {
      return await notifyUrgentItem({
        code: input.code,
        convex,
        expectedVersion: input.expectedVersion,
        idempotencyKey: input.idempotencyKey,
        secret,
      });
    }
    case "reply-decision": {
      return await convex.mutation(api.ai.applyReplyDecision, {
        action: input.action,
        code: input.code,
        expectedVersion: input.expectedVersion,
        replyId: input.replyId as Id<"aiReplies">,
        secret,
        snoozeUntil: input.snoozeUntil,
      });
    }
    case "acknowledge-reply": {
      return await convex.mutation(api.ai.acknowledgeReply, {
        replyId: input.replyId as Id<"aiReplies">,
        result: input.result,
        secret,
      });
    }
    default: {
      const exhaustive: never = input;
      return exhaustive;
    }
  }
}

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      async GET({ request }) {
        const secret = serverEnv.AI_AUTOMATION_SECRET;
        const denial = authorizeAiRequest({ request, secret });
        if (denial || !secret) {
          return denial;
        }
        const parameters = new URL(request.url).searchParams;
        const source = parameters.get("source") ?? undefined;
        const replyCursor = parameters.get("replyCursor") ?? undefined;
        if (source && source.length > 80) {
          return aiJson({ error: "Invalid source." }, 400);
        }
        if (replyCursor && replyCursor.length > 8000) {
          return aiJson({ error: "Invalid reply cursor." }, 400);
        }
        const convex = new ConvexHttpClient(clientEnv.VITE_CONVEX_URL);
        return aiJson(
          await convex.query(api.ai.machineSnapshot, {
            replyCursor,
            secret,
            source,
          })
        );
      },
      async POST({ request }) {
        const secret = serverEnv.AI_AUTOMATION_SECRET;
        const denial = authorizeAiRequest({ request, secret });
        if (denial || !secret) {
          return denial;
        }
        let input: AiRequest;
        try {
          input = await readAiRequest(request);
        } catch {
          return aiJson(
            {
              error:
                "Invalid AI request. Check the operation and required fields.",
            },
            400
          );
        }
        try {
          return aiJson(await dispatch({ input, secret }));
        } catch {
          return aiJson(
            {
              error:
                "AI operation did not complete. Check configuration and current item state before retrying with the same key.",
            },
            409
          );
        }
      },
    },
  },
});
