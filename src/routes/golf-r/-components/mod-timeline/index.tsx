import { motion } from "framer-motion";
import type { Doc } from "convex/_generated/dataModel";

type ModTimelineProps = {
  readonly items: Array<Doc<"golfRItems">>;
};

const categoryEmoji: Record<string, string> = {
  audio: "🔊",
  exterior: "🎨",
  interior: "💺",
  performance: "⚡",
  wheels: "🛞",
};

const categoryAccent: Record<string, string> = {
  audio: "border-violet-500/30 bg-violet-500/5",
  exterior: "border-cyan-500/30 bg-cyan-500/5",
  interior: "border-amber-500/30 bg-amber-500/5",
  performance: "border-red-500/30 bg-red-500/5",
  wheels: "border-emerald-500/30 bg-emerald-500/5",
};

const statusColors: Record<string, string> = {
  false: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  true: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
};

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount);
}

function formatDate(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ModTimeline({ items }: ModTimelineProps) {
  const mods = items.filter(
    (item) =>
      item.category !== "purchase" &&
      item.category !== "tax" &&
      item.category !== "fee",
  );

  if (mods.length === 0) {
    return (
      <div>
        <h2 className="mb-4 font-bold text-2xl tracking-tight">Build Log</h2>
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No mods yet. Stock life for now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-bold text-2xl tracking-tight">Build Log</h2>
        <span className="font-mono text-sm text-muted-foreground">
          {mods.length} mod{mods.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="space-y-3">
        {mods.map((item, index) => {
          const net = item.price - (item.discount ?? 0) - (item.cashback ?? 0);
          const accent =
            categoryAccent[item.category] ?? "border-border bg-card";
          const emoji = categoryEmoji[item.category] ?? "🔧";

          return (
            <motion.div
              key={item._id}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-4 transition-colors hover:border-foreground/10 ${accent}`}
              initial={{ opacity: 0, y: 15 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">{emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-tight">
                        {item.url ? (
                          <a
                            className="underline decoration-foreground/20 underline-offset-2 hover:decoration-foreground"
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
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-mono font-semibold tabular-nums">
                        {formatUsd(net)}
                      </span>
                      {(item.discount ?? 0) > 0 || (item.cashback ?? 0) > 0 ? (
                        <p className="text-xs font-medium text-emerald-500">
                          {(item.discount ?? 0) > 0
                            ? `${formatUsd(item.discount!)} off`
                            : ""}
                          {(item.cashback ?? 0) > 0
                            ? `${(item.discount ?? 0) > 0 ? " + " : ""}${formatUsd(item.cashback!)} back`
                            : ""}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatDate(item.date)}
                    </span>
                    {item.installed === undefined ? null : (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[String(item.installed)]}`}
                      >
                        {item.installed ? "Installed" : "Pending"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
