import { motion } from "framer-motion";
import type { Doc } from "convex/_generated/dataModel";
import {
  categoryLabels,
  formatDate,
  formatMileage,
  formatUsd,
  isAccountingItem,
  netCost,
} from "../lib";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ModTimelineProps = {
  readonly items: Array<Doc<"golfRItems">>;
};

const statusLabels: Record<string, string> = {
  true: "Modification",
};

export function ModTimeline({ items }: ModTimelineProps) {
  const activity = items.filter((item) => !isAccountingItem(item));

  return (
    <Card>
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

      <CardContent className="space-y-4">
        {activity.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
            Add the first mod or service record and it will show up here.
          </div>
        ) : (
          activity.map((item, index) => {
            const savings = (item.discount ?? 0) + (item.cashback ?? 0);

            return (
              <motion.div
                key={item._id}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
                initial={{ opacity: 0, y: 8 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
              >
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          {categoryLabels[item.category] ?? item.category}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
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

                      <div className="space-y-1">
                        <h3 className="text-base font-semibold">
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
                          <p className="text-muted-foreground text-sm leading-6">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="shrink-0 md:text-right">
                      <p className="font-mono text-lg font-semibold">
                        {formatUsd(netCost(item))}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
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
                </div>

                {index < activity.length - 1 ? <Separator /> : null}
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
