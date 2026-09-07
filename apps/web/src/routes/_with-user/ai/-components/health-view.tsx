import { api } from "@repo/backend/api";
import { createConvexRouteQuery } from "convex-route-query";
import { useMutation } from "convex/react";
import { useState } from "react";

import { actionError, formatTime } from "../-lib";
import { ActionSettings } from "./settings-form";

const getHealth = createConvexRouteQuery(api.ai.health);

export function HealthView(props: {
  settings: {
    configured: boolean;
    paperEnabled: boolean;
    pausedSources: string[];
    phone?: string;
  };
}) {
  const { settings } = props;
  const { data, isPending, error: loadError } = getHealth.useQuery();
  const configure = useMutation(api.ai.configure);
  const [pendingSource, setPendingSource] = useState<string>();
  const [saveError, setSaveError] = useState<string>();

  async function toggleSource(source: string) {
    setPendingSource(source);
    setSaveError(undefined);
    try {
      const pausedSources = settings.pausedSources.includes(source)
        ? settings.pausedSources.filter((item) => item !== source)
        : [...settings.pausedSources, source];
      await configure({ pausedSources });
    } catch (error) {
      setSaveError(actionError(error));
    } finally {
      setPendingSource(undefined);
    }
  }

  const pausedSourceSet = new Set(settings.pausedSources);

  return (
    <div className="space-y-6">
      <ActionSettings settings={settings} />
      <section aria-labelledby="source-health-heading">
        <h2 className="heading mb-3 text-xl" id="source-health-heading">
          Source coverage
        </h2>
        {isPending && (
          <output className="muted block">Checking source reports…</output>
        )}
        {loadError && (
          <p className="text-error" role="alert">
            Source reports could not be loaded.
          </p>
        )}
        {saveError && (
          <p className="mb-3 text-sm text-error" role="alert">
            {saveError}
          </p>
        )}
        {data && data.sources.length === 0 && (
          <p className="rounded-box border border-dashed border-base-300 p-5 text-sm text-base-content/65">
            No source has reported coverage yet. This page will show each
            source&apos;s last check and any gaps.
          </p>
        )}
        <div className="space-y-3">
          {data?.sources.map((source) => {
            const paused = pausedSourceSet.has(source.source);
            return (
              <article
                key={source._id}
                className="rounded-box border border-base-300 bg-base-100 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium">{source.source}</h3>
                  <span
                    className={`badge badge-soft ${source.status === "ok" && !source.stale ? "badge-success" : "badge-warning"}`}
                  >
                    {paused ? "reminders paused" : source.status}
                  </span>
                </div>
                {source.message && (
                  <p className="mt-2 text-sm text-base-content/75">
                    {source.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-base-content/55">
                  Last check {formatTime(source.checkedAt)}
                </p>
                {source.stale && (
                  <p className="mt-2 text-sm text-warning">
                    No recent coverage report.
                  </p>
                )}
                {source.coverageThrough && (
                  <p className="mt-1 text-xs text-base-content/55">
                    Covered through {formatTime(source.coverageThrough)}
                  </p>
                )}
                <button
                  className="btn btn-ghost btn-sm mt-3"
                  disabled={Boolean(pendingSource)}
                  type="button"
                  onClick={() => toggleSource(source.source)}
                >
                  {paused ? "Resume reminders" : "Pause reminders"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
      {data && data.receipts.length > 0 && (
        <section aria-labelledby="receipt-history-heading">
          <h2 className="heading mb-3 text-xl" id="receipt-history-heading">
            Recent receipts
          </h2>
          <ul className="divide-y divide-base-300 rounded-box border border-base-300 bg-base-100 px-4">
            {data.receipts.map((receipt) => (
              <li key={receipt._id} className="py-4">
                <a className="link font-medium" href={`/ai/r/${receipt._id}`}>
                  {receipt.title}
                </a>
                <p className="mt-1 text-xs text-base-content/55">
                  Created {formatTime(receipt.createdAt)} ·{" "}
                  {receipt.items.length} items
                </p>
                <p className="mt-2 text-sm">
                  Print: {receipt.printStatus}
                  {receipt.expired ? " · receipt expired" : ""}
                </p>
                {receipt.printError && (
                  <p className="mt-1 text-xs text-error">
                    {receipt.printError}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {data && data.deliveries.length > 0 && (
        <section aria-labelledby="sms-history-heading">
          <h2 className="heading mb-3 text-xl" id="sms-history-heading">
            Recent text alerts
          </h2>
          <ul className="divide-y divide-base-300 rounded-box border border-base-300 bg-base-100 px-4">
            {data.deliveries.map((delivery) => (
              <li
                key={delivery._id}
                className="flex flex-wrap justify-between gap-2 py-4"
              >
                <span className="font-mono text-sm">{delivery.code}</span>
                <span className="text-sm">{delivery.status}</span>
                <p className="w-full text-xs text-base-content/55">
                  Updated {formatTime(delivery.updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
