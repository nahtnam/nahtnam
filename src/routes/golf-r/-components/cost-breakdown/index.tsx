import { motion } from "framer-motion";
import { useState } from "react";
import type { Doc } from "convex/_generated/dataModel";

type CostBreakdownProps = {
  readonly items: Array<Doc<"golfRItems">>;
};

const categoryLabels: Record<string, string> = {
  audio: "Audio",
  exterior: "Exterior",
  fee: "Fees & Registration",
  interior: "Interior",
  performance: "Performance",
  purchase: "Vehicle",
  tax: "Taxes",
  wheels: "Wheels & Tires",
};

const categoryColors: Record<string, string> = {
  audio: "#8b5cf6",
  exterior: "#06b6d4",
  fee: "#71717a",
  interior: "#f59e0b",
  performance: "#ef4444",
  purchase: "#3b82f6",
  tax: "#6b7280",
  wheels: "#10b981",
};

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount);
}

function netCost(item: Doc<"golfRItems">) {
  return item.price - (item.discount ?? 0) - (item.cashback ?? 0);
}

export function CostBreakdown({ items }: CostBreakdownProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | undefined>(
    undefined,
  );

  const grouped = new Map<string, Array<Doc<"golfRItems">>>();
  for (const item of items) {
    const existing = grouped.get(item.category) ?? [];
    existing.push(item);
    grouped.set(item.category, existing);
  }

  const categoryTotals = [...grouped.entries()].map(([category, catItems]) => {
    const total = catItems.reduce((sum, item) => sum + netCost(item), 0);
    return { category, items: catItems, total };
  });

  categoryTotals.sort((a, b) => b.total - a.total);

  const grandTotal = items.reduce((sum, item) => sum + netCost(item), 0);

  return (
    <div>
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="font-bold text-2xl tracking-tight">Cost Breakdown</h2>
        <span className="font-mono text-sm text-muted-foreground">
          {formatUsd(grandTotal)} total
        </span>
      </div>

      <div className="space-y-3">
        {categoryTotals.map(({ category, items: catItems, total }, index) => {
          const isExpanded = expandedCategory === category;
          const percentage = (total / grandTotal) * 100;
          const color = categoryColors[category] ?? "#71717a";

          return (
            <motion.div
              key={category}
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <button
                className="group flex w-full items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/10"
                type="button"
                onClick={() => {
                  setExpandedCategory(isExpanded ? undefined : category);
                }}
              >
                <div
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-sm font-medium">
                      {categoryLabels[category] ?? category}
                    </span>
                    <span className="font-mono text-sm tabular-nums">
                      {formatUsd(total)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      animate={{ width: `${percentage}%` }}
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      style={{ backgroundColor: color }}
                      transition={{
                        delay: 0.3 + index * 0.05,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
                <svg
                  className={`size-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>

              {isExpanded ? (
                <motion.div
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="ml-7 space-y-1 border-l-2 py-2 pl-4"
                    style={{ borderColor: color }}
                  >
                    {catItems.map((item) => {
                      const savings =
                        (item.discount ?? 0) + (item.cashback ?? 0);
                      return (
                        <div
                          key={item._id}
                          className="flex items-center justify-between py-1.5 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {item.url ? (
                              <a
                                className="text-foreground underline decoration-muted-foreground/30 underline-offset-2 hover:decoration-foreground"
                                href={item.url}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                {item.name}
                              </a>
                            ) : (
                              <span>{item.name}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {savings > 0 ? (
                              <span className="text-xs font-medium text-emerald-500">
                                saves {formatUsd(savings)}
                              </span>
                            ) : null}
                            <span className="font-mono tabular-nums text-muted-foreground">
                              {formatUsd(netCost(item))}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
