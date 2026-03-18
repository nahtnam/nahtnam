import { motion } from "framer-motion";
import type { Doc } from "convex/_generated/dataModel";
import { categoryLabels, formatUsd, netCost } from "../lib";
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
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
        <CardDescription>
          Spending by category across the car, mods, and service.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {categories.map(({ category, count, total }, index) => {
          const percentage = grandTotal === 0 ? 0 : (total / grandTotal) * 100;

          return (
            <motion.div
              key={category}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: index * 0.04, duration: 0.25 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {categoryLabels[category] ?? category}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {count} item{count === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-mono text-sm">{formatUsd(total)}</p>
                  <p className="text-muted-foreground text-xs">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="bg-muted h-2 rounded-full">
                <div
                  className="bg-primary h-2 rounded-full transition-[width]"
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
