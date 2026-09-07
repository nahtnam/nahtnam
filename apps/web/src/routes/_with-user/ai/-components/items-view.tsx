import { api } from "@repo/backend/api";
import { keepPreviousData } from "@tanstack/react-query";
import { createConvexRouteQuery } from "convex-route-query";

import { ActionCard } from "./action-card";
import { useAiActions } from "./action-feedback";

const listItems = createConvexRouteQuery(api.ai.list);

type ItemView = "history" | "snoozed" | "today" | "upcoming";
const emptyCopy: Record<ItemView, { body: string; title: string }> = {
  history: {
    body: "Completed and dismissed items will appear here.",
    title: "Nothing closed yet",
  },
  snoozed: {
    body: "Items you put off will return at the time you choose.",
    title: "Nothing snoozed",
  },
  today: {
    body: "New, relevant actions will appear here. There is nothing to catch up on.",
    title: "You're clear for now",
  },
  upcoming: {
    body: "Future actions will appear when there is a useful next step.",
    title: "Nothing coming up",
  },
};

export function ItemsView(props: { now: number; view: ItemView }) {
  const { now, view } = props;
  const { data, isPending, error } = listItems.useQuery(
    { limit: 100, now, view },
    { gcTime: 0, placeholderData: keepPreviousData }
  );
  const { respond } = useAiActions();
  if (isPending) {
    return <output className="muted block py-8">Loading your actions…</output>;
  }
  if (error) {
    return (
      <p className="rounded-box bg-error/10 p-4 text-sm" role="alert">
        Your actions could not be loaded. Try again in a moment.
      </p>
    );
  }
  if (!data?.length) {
    return (
      <div className="rounded-box border border-dashed border-base-300 px-5 py-10 text-center">
        <h2 className="font-medium">{emptyCopy[view].title}</h2>
        <p className="muted mt-2 text-sm">{emptyCopy[view].body}</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <ActionCard key={item._id} item={item} onRespond={respond} />
      ))}
      {data.length === 100 && (
        <p className="muted text-center text-xs">
          Showing the latest 100 items.
        </p>
      )}
    </div>
  );
}
