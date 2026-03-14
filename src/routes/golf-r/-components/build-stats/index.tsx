import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import type { Doc } from "convex/_generated/dataModel";

type BuildStatsProps = {
  readonly items: Array<Doc<"golfRItems">>;
};

function netCost(item: Doc<"golfRItems">) {
  return item.price - (item.discount ?? 0) - (item.cashback ?? 0);
}

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
      const duration = 1500;
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
  }, [isInView, value, delay]);

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
  const mods = items.filter(
    (i) =>
      i.category !== "purchase" && i.category !== "tax" && i.category !== "fee",
  );
  const modSpent = mods.reduce((sum, item) => sum + netCost(item), 0);

  const stats = [
    {
      delay: 0,
      label: "Total Invested",
      value: <AnimatedCounter decimals={2} prefix="$" value={totalSpent} />,
    },
    {
      delay: 100,
      label: "Mod Spend",
      value: <AnimatedCounter decimals={2} prefix="$" value={modSpent} />,
    },
    {
      delay: 200,
      label: "Upgrades",
      value: <AnimatedCounter value={mods.length} />,
    },
    {
      delay: 300,
      label: "Horsepower",
      suffix: "(stock)",
      value: <AnimatedCounter suffix=" hp" value={333} />,
    },
    {
      delay: 400,
      label: "Torque",
      suffix: "(stock)",
      value: <AnimatedCounter suffix=" lb-ft" value={295} />,
    },
    {
      delay: 500,
      label: "0-60 mph",
      value: <AnimatedCounter decimals={1} suffix="s" value={4.6} />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-5"
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: stat.delay / 1000, duration: 0.5 }}
        >
          <p className="mb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {stat.label}
            {stat.suffix ? (
              <span className="ml-1 text-muted-foreground/50 normal-case">
                {stat.suffix}
              </span>
            ) : null}
          </p>
          <p className="font-mono text-xl font-bold tracking-tight md:text-2xl">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
