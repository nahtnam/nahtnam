import { motion } from "framer-motion";
import type { Doc } from "convex/_generated/dataModel";
import {
  categoryLabels,
  formatDate,
  formatMileage,
  formatUsd,
  getCategoryAccent,
  isAccountingItem,
  netCost,
} from "../lib";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/shadcn/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ModTimelineProps = {
  readonly items: Array<Doc<"golfRItems">>;
};

const statusLabels: Record<string, string> = {
  true: "Modification",
};

export function ModTimeline({ items }: ModTimelineProps) {
  const activity = items.filter((item) => !isAccountingItem(item));

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription className="mt-1">
              Mods, maintenance, and equipment purchases with newest entries
              first.
            </CardDescription>
          </div>
          <Badge variant="outline">{activity.length} entries</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {activity.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            Add the first mod or service record and it will show up here.
          </div>
        ) : (
          <ol className="relative ml-1 space-y-6 border-l border-border">
            {activity.map((item, index) => {
              const savings = (item.discount ?? 0) + (item.cashback ?? 0);
              const accent = getCategoryAccent(item.category);

              return (
                <motion.li
                  key={item._id}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative pl-6"
                  initial={{ opacity: 0, y: 8 }}
                  transition={{ delay: index * 0.03, duration: 0.25 }}
                >
                  <span
                    className={cn(
                      "absolute top-1 -left-[5px] size-2.5 rounded-full ring-4 ring-card",
                      accent.dot,
                    )}
                  />

                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-md border px-1.5 py-0.5 font-mono text-[0.6rem] font-medium tracking-wide uppercase",
                            accent.badge,
                          )}
                        >
                          {categoryLabels[item.category] ?? item.category}
                        </span>
                        <span className="font-mono text-[0.66rem] text-muted-foreground">
                          {formatDate(item.date)}
                        </span>
                        {typeof item.mileage === "number" ? (
                          <Badge variant="outline">
                            {formatMileage(item.mileage)}
                          </Badge>
                        ) : null}
                        {(item.modification ?? item.installed) ? (
                          <Badge variant="outline">{statusLabels.true}</Badge>
                        ) : null}
                      </div>

                      <h3 className="text-base font-semibold tracking-tight">
                        {item.url ? (
                          <a
                            className="hover:text-primary underline-offset-4 hover:underline"
                            href={item.url}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {item.name}
                          </a>
                        ) : (
                          item.name
                        )}
                      </h3>
                      {item.description ? (
                        <p className="text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="shrink-0 md:text-right">
                      <p className="font-mono text-base font-semibold">
                        {formatUsd(netCost(item))}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {savings > 0
                          ? `Saved ${formatUsd(savings)}`
                          : item.category === "maintenance"
                            ? "Service entry"
                            : item.category === "equipment"
                              ? "Equipment entry"
                              : "Build entry"}
                      </p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
