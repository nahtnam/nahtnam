import {
  GaugeIcon,
  ReceiptTextIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  formatDate,
  formatMileage,
  isMaintenanceItem,
  isModItem,
  netCost,
} from "./lib";
import type { GolfRItem } from "./types";

type BuildStatsProps = {
  items: GolfRItem[];
};

export function BuildStats(props: BuildStatsProps) {
  const { items } = props;
  const totalSpent = items.reduce((sum, item) => sum + netCost(item), 0);
  const mods = items.filter((item) => isModItem(item));
  const maintenance = items.filter((item) => isMaintenanceItem(item));
  const modSpent = mods.reduce((sum, item) => sum + netCost(item), 0);
  const maintenanceSpent = maintenance.reduce(
    (sum, item) => sum + netCost(item),
    0
  );
  const latestMileageItem = items.find((item) => item.mileage !== undefined);
  const { mileage: latestMileage } = latestMileageItem ?? {};
  const [latestService] = maintenance;
  const cards: BuildStat[] = [
    {
      description: `${items.length} logged item${items.length === 1 ? "" : "s"}`,
      icon: <ReceiptTextIcon aria-hidden="true" className="size-5" />,
      label: "Total invested",
      value: <AnimatedCounter decimals={2} prefix="$" value={totalSpent} />,
    },
    {
      description: `${mods.length} build update${mods.length === 1 ? "" : "s"}`,
      icon: <WrenchIcon aria-hidden="true" className="size-5" />,
      label: "Upgrade spend",
      value: <AnimatedCounter decimals={2} prefix="$" value={modSpent} />,
    },
    {
      description: getMaintenanceDescription({ latestService }),
      icon: <ShieldCheckIcon aria-hidden="true" className="size-5" />,
      label: "Maintenance",
      value:
        maintenance.length > 0 ? (
          <AnimatedCounter decimals={2} prefix="$" value={maintenanceSpent} />
        ) : (
          "Not logged"
        ),
    },
    {
      description: getMileageDescription({ latestMileage }),
      icon: <GaugeIcon aria-hidden="true" className="size-5" />,
      label: "Current odometer",
      value:
        typeof latestMileage === "number"
          ? formatMileage(latestMileage)
          : "Not logged",
    },
  ];

  return (
    <section aria-labelledby="build-stats-heading">
      <h2 className="sr-only" id="build-stats-heading">
        Build statistics
      </h2>
      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-none xl:stats-horizontal">
        {cards.map((card) => (
          <div
            className="stat min-w-0 gap-y-1 px-5 py-5 lg:px-6"
            key={card.label}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-primary">{card.icon}</span>
              <div className="stat-title font-mono text-[0.68rem] tracking-[0.14em] uppercase">
                {card.label}
              </div>
            </div>
            <div className="stat-value mt-2 text-2xl tabular-nums">
              {card.value}
            </div>
            <div className="stat-desc mt-1 whitespace-normal">
              {card.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type BuildStat = {
  description: string;
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

type AnimatedCounterProps = {
  decimals?: number;
  prefix?: string;
  value: number;
};

function AnimatedCounter(props: AnimatedCounterProps) {
  const { decimals = 0, prefix = "", value } = props;
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frameRef.current = requestAnimationFrame(() => {
        setDisplayValue(value);
      });

      return () => {
        cancelAnimationFrame(frameRef.current);
      };
    }

    const startedAt = performance.now();
    const duration = 1000;

    function animate(now: number) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const easedProgress = 1 - (1 - progress) ** 3;
      setDisplayValue(easedProgress * value);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue.toLocaleString("en-US", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })}
    </span>
  );
}

type GetMaintenanceDescriptionOptions = {
  latestService?: GolfRItem;
};

function getMaintenanceDescription(opts: GetMaintenanceDescriptionOptions) {
  const { latestService } = opts;

  if (!latestService) {
    return "Oil changes and service records";
  }

  const formattedDate = formatDate(latestService.date);

  if (typeof latestService.mileage !== "number") {
    return formattedDate;
  }

  return `${formattedDate} · ${formatMileage(latestService.mileage)}`;
}

type GetMileageDescriptionOptions = {
  latestMileage?: number;
};

function getMileageDescription(opts: GetMileageDescriptionOptions) {
  const { latestMileage } = opts;

  return typeof latestMileage === "number"
    ? "Latest recorded mileage"
    : "Add mileage to maintenance entries";
}
