import { motion } from "framer-motion";
import type { Doc } from "convex/_generated/dataModel";

type VehicleLedgerProps = {
  readonly items: Array<Doc<"golfRItems">>;
};

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount);
}

export function VehicleLedger({ items }: VehicleLedgerProps) {
  const purchase = items.filter((i) => i.category === "purchase");
  const taxes = items.filter((i) => i.category === "tax");
  const fees = items.filter((i) => i.category === "fee");

  const purchaseTotal = purchase.reduce((s, i) => s + i.price, 0);
  const purchaseDiscount = purchase.reduce((s, i) => s + (i.discount ?? 0), 0);
  const taxTotal = taxes.reduce((s, i) => s + i.price, 0);
  const feeTotal = fees.reduce((s, i) => s + i.price, 0);
  const otd = purchaseTotal - purchaseDiscount + taxTotal + feeTotal;

  if (purchase.length === 0 && taxes.length === 0 && fees.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-6 font-bold text-2xl tracking-tight">
        Vehicle Purchase
      </h2>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-xl border"
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5 }}
      >
        {purchase.map((item) => (
          <div key={item._id}>
            <div className="flex items-center justify-between border-b bg-card px-4 py-3">
              <span className="font-medium">{item.name}</span>
              <span className="font-mono tabular-nums">
                {formatUsd(item.price)}
              </span>
            </div>
            {(item.discount ?? 0) > 0 ? (
              <div className="flex items-center justify-between border-b bg-card px-4 py-2.5">
                <span className="text-sm text-emerald-500">Discount</span>
                <span className="font-mono text-sm tabular-nums text-emerald-500">
                  -{formatUsd(item.discount!)}
                </span>
              </div>
            ) : null}
          </div>
        ))}

        {taxes.length > 0 ? (
          <div className="border-b bg-muted/30 px-4 py-2">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Taxes
            </span>
          </div>
        ) : null}
        {taxes.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between border-b bg-card px-4 py-2.5"
          >
            <span className="text-sm">{item.name}</span>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {formatUsd(item.price)}
            </span>
          </div>
        ))}

        {fees.length > 0 ? (
          <div className="border-b bg-muted/30 px-4 py-2">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Fees & Registration
            </span>
          </div>
        ) : null}
        {fees.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between border-b bg-card px-4 py-2.5"
          >
            <span className="text-sm">{item.name}</span>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {formatUsd(item.price)}
            </span>
          </div>
        ))}

        <div className="flex items-center justify-between bg-card px-4 py-3">
          <span className="font-semibold">Out the Door</span>
          <span className="font-mono font-bold text-lg tabular-nums">
            {formatUsd(otd)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
