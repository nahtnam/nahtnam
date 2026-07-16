import { categoryLabels, formatUsd, netCost } from "./lib";
import type { GolfRItem } from "./types";

type CostBreakdownProps = {
  items: GolfRItem[];
};

export function CostBreakdown(props: CostBreakdownProps) {
  const { items } = props;
  const grouped = new Map<string, GolfRItem[]>();

  for (const item of items) {
    const categoryItems = grouped.get(item.category) ?? [];
    categoryItems.push(item);
    grouped.set(item.category, categoryItems);
  }

  const unsortedCategories = Array.from(
    grouped.entries(),
    ([category, categoryItems]) => ({
      category,
      count: categoryItems.length,
      total: categoryItems.reduce((sum, item) => sum + netCost(item), 0),
    })
  );
  const categories: typeof unsortedCategories = [];

  for (const category of unsortedCategories) {
    const insertionIndex = categories.findIndex(
      (sortedCategory) => category.total > sortedCategory.total
    );

    if (insertionIndex === -1) {
      categories.push(category);
    } else {
      categories.splice(insertionIndex, 0, category);
    }
  }
  const grandTotal = items.reduce((sum, item) => sum + netCost(item), 0);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="cost-breakdown-heading">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] lg:gap-16">
        <div className="lg:pt-2">
          <p className="route-kicker">Distribution</p>
          <h2 className="heading mt-2 text-3xl" id="cost-breakdown-heading">
            Cost breakdown
          </h2>
          <p className="muted mt-2 max-w-md text-sm leading-6">
            Spending by category across the car, mods, and service.
          </p>
          <div className="mt-8 border-l-2 border-primary pl-4">
            <p className="font-mono text-[0.68rem] tracking-[0.14em] text-base-content/55 uppercase">
              All-in total
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold tabular-nums">
              {formatUsd(grandTotal)}
            </p>
          </div>
        </div>

        <div className="grid border-t border-l border-base-300 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((entry, index) => {
            const percentage =
              grandTotal === 0 ? 0 : (entry.total / grandTotal) * 100;

            return (
              <article
                className={`flex min-h-40 flex-col justify-between border-r border-b border-base-300 p-5 sm:p-6 ${getFinalCellSpan({ categoryCount: categories.length, index })}`}
                key={entry.category}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium">
                    {categoryLabels[entry.category] ?? entry.category}
                  </p>
                  <span className="font-mono text-[0.65rem] text-base-content/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-8">
                  <p className="font-mono text-xl font-semibold tabular-nums">
                    {formatUsd(entry.total)}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-base-content/55">
                    <span>
                      {entry.count} item{entry.count === 1 ? "" : "s"}
                    </span>
                    <span className="font-mono tabular-nums">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type GetFinalCellSpanOptions = {
  categoryCount: number;
  index: number;
};

function getFinalCellSpan(opts: GetFinalCellSpanOptions) {
  const { categoryCount, index } = opts;

  if (index !== categoryCount - 1) {
    return "";
  }

  const mediumSpan = categoryCount % 2 === 1 ? "sm:col-span-2" : "";
  let largeSpan = "lg:col-span-1";

  if (categoryCount % 3 === 1) {
    largeSpan = "lg:col-span-3";
  } else if (categoryCount % 3 === 2) {
    largeSpan = "lg:col-span-2";
  }

  return `${mediumSpan} ${largeSpan}`;
}
