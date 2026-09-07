import { api } from "@repo/backend/api";
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
import { useState } from "react";

import { HealthView } from "./-components/health-view";
import { ItemsView } from "./-components/items-view";
import { ActionSettings } from "./-components/settings-form";

const getSettings = createConvexRouteQuery(api.ai.getSettings);
const views = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming / snoozed" },
  { id: "history", label: "History" },
  { id: "health", label: "Health" },
] as const;

export const Route = createFileRoute("/_with-user/ai/")({
  async loader({ context }) {
    await getSettings.prefetchQuery(context.queryClient);
  },
  component: ActionCenter,
});

function ActionCenter() {
  const { data: settings } = getSettings.useSuspenseQuery();
  const [view, setView] = useState<(typeof views)[number]["id"]>("today");

  if (!settings.configured) {
    return <ActionSettings settings={settings} />;
  }

  return (
    <div>
      {!settings.paperEnabled && (
        <p className="mb-4 rounded-box bg-base-200 p-3 text-sm">
          Action receipts are paused. You can still review and update items
          here.
        </p>
      )}
      <fieldset
        className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
        aria-label="Action views"
      >
        {views.map((tab) => (
          <button
            key={tab.id}
            aria-pressed={view === tab.id}
            className={`btn min-h-11 ${view === tab.id ? "btn-neutral" : "btn-ghost border-base-300"}`}
            type="button"
            onClick={() => setView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </fieldset>
      {view === "today" && <ItemsView view="today" />}
      {view === "history" && <ItemsView view="history" />}
      {view === "upcoming" && (
        <div className="space-y-7">
          <section>
            <h2 className="heading mb-3 text-xl">Upcoming</h2>
            <ItemsView view="upcoming" />
          </section>
          <section>
            <h2 className="heading mb-3 text-xl">Snoozed</h2>
            <ItemsView view="snoozed" />
          </section>
        </div>
      )}
      {view === "health" && <HealthView settings={settings} />}
    </div>
  );
}
