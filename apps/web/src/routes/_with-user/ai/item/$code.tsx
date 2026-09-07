import { api } from "@repo/backend/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";

import { ActionCard } from "../-components/action-card";
import { useAiActions } from "../-components/action-feedback";
import { FeedbackComposer } from "../-components/feedback-composer";
import { formatTime } from "../-lib";

const getItem = createConvexRouteQuery(api.ai.getItem);

export const Route = createFileRoute("/_with-user/ai/item/$code")({
  component: ItemPage,
});

function ItemPage() {
  const { code } = Route.useParams();
  const { data, isPending, error } = getItem.useQuery({ code });
  const { respond, undo } = useAiActions();
  if (isPending) {
    return (
      <output className="muted block py-8">Loading current details…</output>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-box border border-base-300 p-5">
        <h1 className="heading text-xl">Item unavailable</h1>
        <p className="muted mt-2 text-sm">
          This action could not be found for your account.
        </p>
        <Link className="btn mt-4" to="/ai">
          Open action center
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <ActionCard item={data.item} onRespond={respond} />
      <FeedbackComposer
        key={code}
        code={code}
        expectedVersion={data.item.version}
      />
      {data.actions.length > 0 && (
        <section aria-labelledby="action-history-heading">
          <h2 className="heading mb-3 text-xl" id="action-history-heading">
            History
          </h2>
          <ol className="divide-y divide-base-300 rounded-box border border-base-300 bg-base-100 px-4">
            {data.actions.map((action) => (
              <li
                key={action._id}
                className="flex items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="text-sm capitalize">
                    {action.action.replaceAll("_", " ")}
                    {action.undoneAt ? " · undone" : ""}
                  </p>
                  <p className="mt-1 text-xs text-base-content/55">
                    {formatTime(action.at)}
                  </p>
                </div>
                {!action.undoneAt &&
                  action.action !== "undo" &&
                  data.item.lastActionId === action._id && (
                    <button
                      className="btn btn-sm"
                      type="button"
                      onClick={() => undo(action._id)}
                    >
                      Undo
                    </button>
                  )}
              </li>
            ))}
          </ol>
        </section>
      )}
      <Link className="btn btn-ghost" to="/ai">
        All current actions
      </Link>
    </div>
  );
}
