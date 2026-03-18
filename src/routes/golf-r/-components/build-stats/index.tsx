import { motion, useInView } from "framer-motion";
import { Gauge, ReceiptText, ShieldCheck, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Doc } from "convex/_generated/dataModel";
import {
  formatDate,
  formatMileage,
  isMaintenanceItem,
  isModItem,
  netCost,
} from "../lib";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BuildStatsProps = {
  readonly items: Array<Doc<"golfRItems">>;
};

function AnimatedCounter(props: {
  readonly decimals?: number;
  readonly delay?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly value: number;
}) {
  const { value, prefix = "", suffix = "", decimals = 0, delay = 0 } = props;
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const timeout = setTimeout(() => {
      const duration = 1200;
      const startTime = performance.now();

      function animate(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - (1 - progress) ** 3;

        setDisplayValue(eased * value);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [delay, isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {displayValue.toLocaleString("en-US", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export function BuildStats({ items }: BuildStatsProps) {
  const totalSpent = items.reduce((sum, item) => sum + netCost(item), 0);
  const mods = items.filter((item) => isModItem(item));
  const maintenance = items.filter((item) => isMaintenanceItem(item));
  const modSpent = mods.reduce((sum, item) => sum + netCost(item), 0);
  const maintenanceSpent = maintenance.reduce(
    (sum, item) => sum + netCost(item),
    0,
  );
  const latestMileage = items.find(
    (item) => item.mileage !== undefined,
  )?.mileage;
  const latestService = maintenance[0];

  const cards = [
    {
      description: `${items.length} logged item${items.length === 1 ? "" : "s"}`,
      icon: ReceiptText,
      title: "Total Invested",
      value: <AnimatedCounter decimals={2} prefix="$" value={totalSpent} />,
    },
    {
      description: `${mods.length} build update${mods.length === 1 ? "" : "s"}`,
      icon: Wrench,
      title: "Upgrade Spend",
      value: <AnimatedCounter decimals={2} prefix="$" value={modSpent} />,
    },
    {
      description: latestService
        ? `${formatDate(latestService.date)}${typeof latestService.mileage === "number" ? ` • ${formatMileage(latestService.mileage)}` : ""}`
        : "Oil changes and service records",
      icon: ShieldCheck,
      title: "Maintenance",
      value:
        maintenance.length > 0 ? (
          <AnimatedCounter decimals={2} prefix="$" value={maintenanceSpent} />
        ) : (
          "Not logged"
        ),
    },
    {
      description: latestMileage
        ? "Latest recorded mileage"
        : "Add mileage to maintenance entries",
      icon: Gauge,
      title: "Current Odometer",
      value:
        typeof latestMileage === "number"
          ? formatMileage(latestMileage)
          : "Not logged",
    },
  ];

  return (
    <section className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
          >
            <Card className="h-full min-h-56 justify-between gap-4">
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <div className="text-muted-foreground rounded-md border p-2">
                    <Icon className="size-4" />
                  </div>
                </div>
                <CardDescription className="min-h-12">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl font-semibold tracking-tight">
                  {card.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </section>
  );
}
