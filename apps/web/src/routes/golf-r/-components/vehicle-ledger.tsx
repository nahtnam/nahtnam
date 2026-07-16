import { formatUsd } from "./lib";
import type { GolfRItem } from "./types";

type VehicleLedgerProps = {
  items: GolfRItem[];
};

export function VehicleLedger(props: VehicleLedgerProps) {
  const { items } = props;
  const purchase = items.filter((item) => item.category === "purchase");
  const taxes = items.filter((item) => item.category === "tax");
  const fees = items.filter((item) => item.category === "fee");
  const purchaseTotal = purchase.reduce((sum, item) => sum + item.price, 0);
  const purchaseDiscount = purchase.reduce(
    (sum, item) => sum + (item.discount ?? 0),
    0
  );
  const taxTotal = taxes.reduce((sum, item) => sum + item.price, 0);
  const feeTotal = fees.reduce((sum, item) => sum + item.price, 0);
  const outTheDoor = purchaseTotal - purchaseDiscount + taxTotal + feeTotal;
  const sections = [
    {
      items: purchase,
      label: "Vehicle",
      total: purchaseTotal - purchaseDiscount,
    },
    { items: taxes, label: "Taxes", total: taxTotal },
    { items: fees, label: "Fees", total: feeTotal },
  ].filter((section) => section.items.length > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="purchase-ledger-heading">
      <div className="flex flex-col justify-between gap-5 border-b border-base-300 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="route-kicker">Accounting</p>
          <h2 className="heading mt-2 text-3xl" id="purchase-ledger-heading">
            Purchase ledger
          </h2>
          <p className="muted mt-2 text-sm">
            Purchase price, taxes, and registration costs.
          </p>
        </div>
        <div className="sm:text-right">
          <p className="font-mono text-[0.68rem] tracking-[0.14em] text-base-content/55 uppercase">
            Out the door
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums sm:text-3xl">
            {formatUsd(outTheDoor)}
          </p>
        </div>
      </div>

      <div className="mt-6 border-y border-base-300">
        <table className="table">
          <thead>
            <tr className="border-base-300 font-mono text-[0.65rem] tracking-[0.12em] uppercase">
              <th>Line item</th>
              <th className="hidden sm:table-cell">Category</th>
              <th className="hidden text-right sm:table-cell">Retail</th>
              <th className="hidden text-right sm:table-cell">Credits</th>
              <th className="text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <LedgerSection key={section.label} section={section} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type LedgerSectionProps = {
  section: {
    items: GolfRItem[];
    label: string;
    total: number;
  };
};

function LedgerSection(props: LedgerSectionProps) {
  const { section } = props;

  return (
    <>
      {section.items.map((item) => {
        const credits = (item.discount ?? 0) + (item.cashback ?? 0);

        return (
          <tr className="border-base-200" key={item._id}>
            <td className="py-4 sm:min-w-56">
              <p className="font-medium">{item.name}</p>
              {item.description ? (
                <p className="mt-1 max-w-xl text-xs leading-5 text-base-content/55">
                  {item.description}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] text-base-content/55 sm:hidden">
                <span className="badge badge-ghost badge-xs">
                  {section.label}
                </span>
                <span className="font-mono tabular-nums">
                  Retail {formatUsd(item.price)}
                </span>
                {credits > 0 ? (
                  <span className="font-mono tabular-nums">
                    Credits -{formatUsd(credits)}
                  </span>
                ) : null}
              </div>
            </td>
            <td className="hidden sm:table-cell">
              <span className="badge badge-ghost badge-sm whitespace-nowrap">
                {section.label}
              </span>
            </td>
            <td className="hidden text-right font-mono text-sm tabular-nums sm:table-cell">
              {formatUsd(item.price)}
            </td>
            <td className="hidden text-right font-mono text-sm tabular-nums text-base-content/55 sm:table-cell">
              {credits > 0 ? `-${formatUsd(credits)}` : "—"}
            </td>
            <td className="text-right font-mono text-sm font-semibold tabular-nums">
              {formatUsd(item.price - credits)}
            </td>
          </tr>
        );
      })}
      <tr className="border-base-300 bg-base-200/45">
        <th className="py-3" scope="row">
          <span className="font-mono text-[0.68rem] tracking-[0.12em] uppercase">
            {section.label} subtotal
          </span>
        </th>
        <td className="hidden sm:table-cell">
          <span className="sr-only">Not applicable</span>
        </td>
        <td className="hidden sm:table-cell">
          <span className="sr-only">Not applicable</span>
        </td>
        <td className="hidden sm:table-cell">
          <span className="sr-only">Not applicable</span>
        </td>
        <td className="text-right font-mono text-sm font-semibold tabular-nums">
          {formatUsd(section.total)}
        </td>
      </tr>
    </>
  );
}
