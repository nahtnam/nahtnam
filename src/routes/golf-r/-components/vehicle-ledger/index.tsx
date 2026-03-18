import { motion } from "framer-motion";
import type { Doc } from "convex/_generated/dataModel";
import { formatUsd } from "../lib";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type VehicleLedgerProps = {
  readonly items: Array<Doc<"golfRItems">>;
};

export function VehicleLedger({ items }: VehicleLedgerProps) {
  const purchase = items.filter((item) => item.category === "purchase");
  const taxes = items.filter((item) => item.category === "tax");
  const fees = items.filter((item) => item.category === "fee");

  const purchaseTotal = purchase.reduce((sum, item) => sum + item.price, 0);
  const purchaseDiscount = purchase.reduce(
    (sum, item) => sum + (item.discount ?? 0),
    0,
  );
  const taxTotal = taxes.reduce((sum, item) => sum + item.price, 0);
  const feeTotal = fees.reduce((sum, item) => sum + item.price, 0);
  const outTheDoor = purchaseTotal - purchaseDiscount + taxTotal + feeTotal;

  if (purchase.length === 0 && taxes.length === 0 && fees.length === 0) {
    return null;
  }

  const sections = [
    {
      items: purchase,
      label: "Vehicle",
      total: purchaseTotal - purchaseDiscount,
    },
    {
      items: taxes,
      label: "Taxes",
      total: taxTotal,
    },
    {
      items: fees,
      label: "Fees",
      total: feeTotal,
    },
  ].filter((section) => section.items.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Purchase Ledger</CardTitle>
            <CardDescription className="mt-1">
              Purchase price, taxes, and registration costs.
            </CardDescription>
          </div>
          <Badge variant="outline">OTD {formatUsd(outTheDoor)}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.label}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border"
            initial={{ opacity: 0, y: 8 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
          >
            <div className="bg-muted/30 flex items-center justify-between rounded-t-lg border-b px-4 py-3">
              <p className="text-sm font-medium">{section.label}</p>
              <p className="font-mono text-sm">{formatUsd(section.total)}</p>
            </div>

            <div className="divide-y">
              {section.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.description ? (
                      <p className="text-muted-foreground text-sm">
                        {item.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-sm">{formatUsd(item.price)}</p>
                    {(item.discount ?? 0) > 0 ? (
                      <p className="text-sm text-emerald-600">
                        -{formatUsd(item.discount ?? 0)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
