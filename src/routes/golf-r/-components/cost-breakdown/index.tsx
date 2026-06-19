import { motion } from "framer-motion";
import type { Doc } from "convex/_generated/dataModel";
import { categoryLabels, formatUsd, getCategoryAccent, netCost } from "../lib";
import { cn } from "@/lib/shadcn/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CostBreakdownProps = {
  readonly items: Array<Doc<"golfRItems">>;
};

export function CostBreakdown({ items }: CostBreakdownProps) {
  const grouped = new Map<string, Array<Doc<"golfRItems">>>();

  for (const item of items) {
    const entries = grouped.get(item.category) ?? [];
    entries.push(item);
    grouped.set(item.category, entries);
  }

  const categories = [...grouped.entries()]
    .map(([category, categoryItems]) => ({
      category,
      count: categoryItems.length,
      total: categoryItems.reduce((sum, item) => sum + netCost(item), 0),
    }))
    .sort((left, right) => right.total - left.total);

  const grandTotal = items.reduce((sum, item) => sum + netCost(item), 0);

  if (categories.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
        <CardDescription>
          Spending by category across the car, mods, and service.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {categories.map(({ category, count, total }, index) => {
          const percentage = grandTotal === 0 ? 0 : (total / grandTotal) * 100;
          const accent = getCategoryAccent(category);

          return (
            <motion.div
              key={category}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: index * 0.04, duration: 0.25 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", accent.dot)} />
                  <p className="text-sm font-medium">
                    {categoryLabels[category] ?? category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {count} item{count === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-mono text-sm">{formatUsd(total)}</p>
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width]",
                    accent.bar,
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
