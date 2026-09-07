import { api } from "@repo/backend/api";
import type { Id } from "@repo/backend/data-model";
import { useMutation } from "convex/react";
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { actionError } from "../-lib";
import type { AiResponse } from "../-lib";

type Actions = {
  respond: (response: AiResponse) => Promise<void>;
  undo: (actionId: Id<"aiActions">) => Promise<void>;
};
const ActionsContext = createContext<Actions | null>(null);

export function useAiActions() {
  const actions = useContext(ActionsContext);
  if (!actions) {
    throw new Error("Action center is unavailable.");
  }
  return actions;
}

export function ActionFeedbackProvider(props: { children: ReactNode }) {
  const { children } = props;
  const saveResponse = useMutation(api.ai.respond);
  const undoResponse = useMutation(api.ai.undo);
  const [notice, setNotice] = useState<{
    actionId?: Id<"aiActions">;
    message: string;
  }>();
  const [feedbackError, setFeedbackError] = useState<string>();
  const [undoing, setUndoing] = useState(false);

  async function respond(response: AiResponse) {
    const result = await saveResponse(response);
    setFeedbackError(undefined);
    setNotice({
      actionId: result.actionId,
      message: `${response.code}: saved.`,
    });
  }

  async function undo(actionId: Id<"aiActions">) {
    setUndoing(true);
    setFeedbackError(undefined);
    try {
      await undoResponse({ actionId });
      setNotice({ message: "Change undone." });
    } catch (error) {
      setFeedbackError(actionError(error));
    } finally {
      setUndoing(false);
    }
  }

  const actions = { respond, undo };

  return (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- React Compiler memoizes this value; manual memoization is disabled in this app.
    <ActionsContext value={actions}>
      {(notice || feedbackError) && (
        <output
          className="sticky top-3 z-10 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-box border border-base-300 bg-base-100 p-3 shadow-sm"
          role={feedbackError ? "alert" : undefined}
        >
          <span className={feedbackError ? "text-sm text-error" : "text-sm"}>
            {feedbackError ?? notice?.message}
          </span>
          <div className="flex gap-2">
            {notice?.actionId && (
              <button
                className="btn btn-sm"
                disabled={undoing}
                type="button"
                onClick={() => notice.actionId && undo(notice.actionId)}
              >
                Undo
              </button>
            )}
            <button
              aria-label="Dismiss confirmation"
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => {
                setNotice(undefined);
                setFeedbackError(undefined);
              }}
            >
              Close
            </button>
          </div>
        </output>
      )}
      {children}
    </ActionsContext>
  );
}
