import { createForm } from "@formadapter/react";
import { api } from "@repo/backend/api";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { CheckCircle2Icon, UploadIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { AdminPageHeader } from "../-components/admin-page-header";

type ParsedFlight = {
  aircraftType: string;
  airline: string;
  date: string;
  flightNumber: string;
  flightyId: string;
  from: string;
  to: string;
};

type ImportResult = {
  created: number;
  updated: number;
};

const uploadSchema = z.object({
  file: z
    .file()
    .max(50_000_000, "Choose a CSV smaller than 50 MB.")
    .refine(
      (file) =>
        file.name.toLowerCase().endsWith(".csv") ||
        file.type === "text/csv" ||
        file.type === "application/vnd.ms-excel",
      "Choose a Flighty CSV export."
    ),
});

const UploadForm = createForm(uploadSchema).configure({
  fields: {
    file: {
      control: "file",
      controlProps: { accept: ".csv,text/csv" },
      description: "Choose the CSV exported by Flighty.",
      label: "Flighty CSV",
    },
  },
});

const requiredHeaders = [
  "Date",
  "Airline",
  "Flight",
  "From",
  "To",
  "Aircraft Type Name",
  "Flight Flighty ID",
] as const;

export const Route = createFileRoute("/_with-user/admin/travel/")({
  component: TravelAdminPage,
});

function TravelAdminPage() {
  const upsertFlights = useMutation(api.admin.travel.upsertFlights);
  const [flights, setFlights] = useState<ParsedFlight[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult>();

  return (
    <div>
      <AdminPageHeader
        description="Preview a Flighty export, then upsert it in bounded batches. Existing Flighty IDs are updated."
        eyebrow="Flight log"
        title="Travel import"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <section className="card card-border h-fit bg-base-100">
          <div className="card-body gap-6">
            <div>
              <h2 className="card-title">Choose an export</h2>
              <p className="muted mt-1">
                Quoted commas, escaped quotes, and embedded line breaks are
                parsed before anything is written.
              </p>
            </div>
            <UploadForm.Form
              resetOnSuccess={false}
              submitLabel="Preview CSV"
              onSubmit={async (values) => {
                try {
                  const parsedFlights = parseFlightyCsv({
                    csv: await values.file.text(),
                  });
                  setFlights(parsedFlights);
                  setResult(undefined);

                  return {
                    message: `${parsedFlights.length} flights ready to import.`,
                    status: "success" as const,
                  };
                } catch (error) {
                  return {
                    errorKind: "validation" as const,
                    fieldErrors: {
                      file: [
                        error instanceof Error
                          ? error.message
                          : "The CSV could not be parsed.",
                      ],
                    },
                    formErrors: [],
                    status: "error" as const,
                  };
                }
              }}
            />
            {result ? (
              <output className="alert alert-success">
                <CheckCircle2Icon className="size-5" />
                <span>
                  Created {result.created}, updated {result.updated} flights.
                </span>
              </output>
            ) : null}
          </div>
        </section>

        <section className="card card-border bg-base-100">
          <div className="card-body gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="card-title">Import preview</h2>
                <p className="muted mt-1">
                  {flights.length === 0
                    ? "Choose a CSV to inspect its first rows."
                    : `${flights.length} valid flights found.`}
                </p>
              </div>
              <button
                className="btn"
                disabled={flights.length === 0 || isImporting}
                type="button"
                onClick={async () => {
                  setIsImporting(true);
                  try {
                    const batches = chunkFlights({ flights, size: 50 });
                    const totals = await importFlightBatches({
                      batches,
                      index: 0,
                      totals: { created: 0, updated: 0 },
                      upsertFlights,
                    });
                    setResult(totals);
                    setFlights([]);
                  } finally {
                    setIsImporting(false);
                  }
                }}
              >
                {isImporting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <UploadIcon className="size-4" />
                )}
                {isImporting ? "Importing…" : "Import flights"}
              </button>
            </div>

            {flights.length === 0 ? (
              <div className="grid min-h-64 place-items-center rounded-box border border-dashed border-base-300">
                <p className="muted">No preview yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-box border border-base-300">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Flight</th>
                      <th>Route</th>
                      <th>Aircraft</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.slice(0, 8).map((flight) => (
                      <tr key={flight.flightyId}>
                        <td>{flight.date}</td>
                        <td>
                          {flight.airline} {flight.flightNumber}
                        </td>
                        <td>
                          {flight.from} → {flight.to}
                        </td>
                        <td>{flight.aircraftType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

type UpsertFlights = (options: {
  flights: ParsedFlight[];
}) => Promise<ImportResult>;

type ImportFlightBatchesOptions = {
  batches: ParsedFlight[][];
  index: number;
  totals: ImportResult;
  upsertFlights: UpsertFlights;
};

async function importFlightBatches(options: ImportFlightBatchesOptions) {
  const { batches, index, totals, upsertFlights } = options;
  const batch = batches[index];
  if (!batch) {
    return totals;
  }

  const result = await upsertFlights({ flights: batch });

  return importFlightBatches({
    batches,
    index: index + 1,
    totals: {
      created: totals.created + result.created,
      updated: totals.updated + result.updated,
    },
    upsertFlights,
  });
}

function chunkFlights(options: { flights: ParsedFlight[]; size: number }) {
  const { flights, size } = options;
  const batches: ParsedFlight[][] = [];

  for (let index = 0; index < flights.length; index += size) {
    batches.push(flights.slice(index, index + size));
  }

  return batches;
}

function parseFlightyCsv(options: { csv: string }) {
  const { csv } = options;
  const rows = parseCsvRows({ csv });
  const headers = rows[0]?.map((header) => header.trim()) ?? [];
  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Missing columns: ${missingHeaders.join(", ")}`);
  }

  const column = Object.fromEntries(
    headers.map((header, index) => [header, index])
  );

  const flights: ParsedFlight[] = [];

  for (const row of rows.slice(1)) {
    const flight: ParsedFlight = {
      aircraftType:
        valueAt({ column, header: "Aircraft Type Name", row }) || "Unknown",
      airline: valueAt({ column, header: "Airline", row }),
      date: valueAt({ column, header: "Date", row }),
      flightNumber: valueAt({ column, header: "Flight", row }),
      flightyId: valueAt({ column, header: "Flight Flighty ID", row }),
      from: valueAt({ column, header: "From", row }),
      to: valueAt({ column, header: "To", row }),
    };

    if (flight.flightyId && flight.from && flight.to) {
      flights.push(flight);
    }
  }

  return flights;
}

type ValueAtOptions = {
  column: Record<string, number>;
  header: (typeof requiredHeaders)[number];
  row: string[];
};

function valueAt(options: ValueAtOptions) {
  const { column, header, row } = options;
  const index = column[header];

  return index === undefined ? "" : (row[index]?.trim() ?? "");
}

function parseCsvRows(options: { csv: string }) {
  const { csv } = options;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const next = csv[index + 1];

    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  row.push(field);
  if (row.some(Boolean)) {
    rows.push(row);
  }

  if (quoted) {
    throw new Error("The CSV ends inside a quoted field.");
  }

  return rows;
}
