import { ExternalLinkIcon } from "lucide-react";

import {
  categoryLabels,
  formatDate,
  formatMileage,
  formatUsd,
  isAccountingItem,
  netCost,
} from "./lib";
import type { GolfRItem } from "./types";

type ModTimelineProps = {
  items: GolfRItem[];
};

export function ModTimeline(props: ModTimelineProps) {
  const { items } = props;
  const activity = items.filter((item) => !isAccountingItem(item));

  return (
    <section aria-labelledby="recent-activity-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="route-kicker">Chronology</p>
          <h2 className="heading mt-2 text-3xl" id="recent-activity-heading">
            Build journal
          </h2>
          <p className="muted mt-2 max-w-xl text-sm leading-6">
            Mods, maintenance, and equipment purchases with newest entries
            first.
          </p>
        </div>
        <span className="badge badge-outline shrink-0 font-mono">
          {activity.length} entries
        </span>
      </div>

      {activity.length === 0 ? (
        <div className="alert mt-6">
          <span>
            Add the first mod or service record and it will show up here.
          </span>
        </div>
      ) : (
        <ol className="mt-8 overflow-hidden border-y border-base-300">
          {activity.map((item) => (
            <li
              className="grid border-b border-base-300 last:border-b-0 sm:grid-cols-[10rem_minmax(0,1fr)_9rem]"
              key={item._id}
            >
              <div className="flex items-center justify-between gap-3 bg-base-200/45 px-5 py-4 sm:block sm:border-r sm:border-base-300 sm:px-6 sm:py-6">
                <time className="font-mono text-xs font-medium tracking-wide text-base-content/70 uppercase">
                  {formatDate(item.date)}
                </time>
                <span className="status status-primary status-sm sm:mt-4" />
              </div>

              <article className="min-w-0 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-outline badge-sm">
                    {categoryLabels[item.category] ?? item.category}
                  </span>
                  {typeof item.mileage === "number" ? (
                    <span className="badge badge-ghost badge-sm font-mono">
                      {formatMileage(item.mileage)}
                    </span>
                  ) : null}
                  {(item.modification ?? item.installed) ? (
                    <span className="badge badge-ghost badge-sm">
                      Modification
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 text-lg font-semibold tracking-tight">
                  {item.url ? (
                    <a
                      className="link inline-flex items-center gap-1.5 decoration-base-content/30 underline-offset-4 hover:decoration-primary"
                      href={item.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {item.name}
                      <ExternalLinkIcon
                        aria-hidden="true"
                        className="size-3.5"
                      />
                    </a>
                  ) : (
                    item.name
                  )}
                </h3>
                {item.description ? (
                  <p className="muted mt-2 max-w-2xl text-sm leading-6">
                    {item.description}
                  </p>
                ) : null}
              </article>

              <ActivityCost item={item} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

type ActivityCostProps = {
  item: GolfRItem;
};

function ActivityCost(props: ActivityCostProps) {
  const { item } = props;
  const savings = (item.discount ?? 0) + (item.cashback ?? 0);
  let description = "Build entry";

  if (savings > 0) {
    description = `Saved ${formatUsd(savings)}`;
  } else if (item.category === "maintenance") {
    description = "Service entry";
  } else if (item.category === "equipment") {
    description = "Equipment entry";
  }

  return (
    <div className="border-t border-base-200 px-5 py-4 sm:border-t-0 sm:px-6 sm:py-6 sm:text-right">
      <p className="font-mono text-base font-semibold tabular-nums">
        {formatUsd(netCost(item))}
      </p>
      <p className="mt-1 text-xs text-base-content/50">{description}</p>
    </div>
  );
}
