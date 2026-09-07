import { api } from "@repo/backend/api";
import type { Id } from "@repo/backend/data-model";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";

import { ActionCard } from "../-components/action-card";
import { useAiActions } from "../-components/action-feedback";
import { FeedbackComposer } from "../-components/feedback-composer";
import { formatTime } from "../-lib";

const getReceipt = createConvexRouteQuery(api.ai.getReceipt);

export const Route = createFileRoute("/_with-user/ai/r/$receiptId")({
  component: ReceiptPage,
});

function ReceiptPage() {
  const { receiptId } = Route.useParams();
  const { data, isPending, error } = getReceipt.useQuery({
    id: receiptId as Id<"aiReceipts">,
  });
  const { respond } = useAiActions();
  if (isPending) {
    return <output className="muted block py-8">Opening your receipt…</output>;
  }
  if (error || !data) {
    return (
      <div className="rounded-box border border-base-300 p-5">
        <h1 className="heading text-xl">Receipt unavailable</h1>
        <p className="muted mt-2 text-sm">
          This link may be invalid or belong to a different account.
        </p>
        <Link className="btn mt-4" to="/ai">
          Open action center
        </Link>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-6">
        <h1 className="heading text-2xl">{data.receipt.title}</h1>
        <p className="muted mt-2 text-sm">
          Receipt from {formatTime(data.receipt.createdAt)}. Showing the current
          state of these {data.items.length} items.
        </p>
      </div>
      <div className="space-y-4">
        {data.items.map(({ current, snapshot, changed }) =>
          current ? (
            <ActionCard
              key={snapshot.code}
              item={current}
              receipt={{
                changed,
                expired: data.expired,
                expiresAt: data.receipt.expiresAt,
                id: data.receipt._id,
                version: snapshot.version,
              }}
              onRespond={respond}
            />
          ) : (
            <div
              key={snapshot.code}
              className="rounded-box border border-base-300 p-5"
            >
              <p className="font-mono text-xs text-base-content/55">
                {snapshot.code}
              </p>
              <h2 className="mt-2 font-medium">{snapshot.title}</h2>
              <p className="muted mt-2 text-sm">
                This item is no longer available.
              </p>
            </div>
          )
        )}
      </div>
      <div className="mt-6">
        <FeedbackComposer key={data.receipt._id} receiptId={data.receipt._id} />
      </div>
      <Link className="btn btn-ghost mt-6" to="/ai">
        All current actions
      </Link>
    </div>
  );
}
