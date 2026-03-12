/* eslint-disable sort-keys, react/jsx-no-bind, no-await-in-loop */
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ParsedFlight = {
  date: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  aircraftType: string;
  flightyId: string;
};

function parseFlightyCSV(csv: string): ParsedFlight[] {
  const lines = csv.trim().split("\n");
  const headers = (lines[0] ?? "").split(",");

  const colIndex = (name: string) => headers.indexOf(name);

  const dateIdx = colIndex("Date");
  const airlineIdx = colIndex("Airline");
  const flightIdx = colIndex("Flight");
  const fromIdx = colIndex("From");
  const toIdx = colIndex("To");
  const aircraftIdx = colIndex("Aircraft Type Name");
  const flightyIdx = colIndex("Flight Flighty ID");

  return lines
    .slice(1)
    .map((line) => {
      const cols = parseCSVLine(line);
      return {
        date: (dateIdx >= 0 ? cols[dateIdx] : "") ?? "",
        airline: (airlineIdx >= 0 ? cols[airlineIdx] : "") ?? "",
        flightNumber: (flightIdx >= 0 ? cols[flightIdx] : "") ?? "",
        from: (fromIdx >= 0 ? cols[fromIdx] : "") ?? "",
        to: (toIdx >= 0 ? cols[toIdx] : "") ?? "",
        aircraftType: (aircraftIdx >= 0 ? cols[aircraftIdx] : "") ?? "Unknown",
        flightyId: (flightyIdx >= 0 ? cols[flightyIdx] : "") ?? "",
      };
    })
    .filter((f) => f.flightyId && f.from && f.to);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export const Route = createFileRoute("/admin/travel/")({
  component: TravelAdmin,
});

function TravelAdmin() {
  const { adminSecret } = Route.useRouteContext();
  const [parsed, setParsed] = useState<ParsedFlight[]>([]);
  const [status, setStatus] = useState<
    "idle" | "parsing" | "uploading" | "done"
  >("idle");
  const [result, setResult] = useState<
    { created: number; updated: number } | undefined
  >(undefined);

  const { mutateAsync: upsertFlights } = useMutation({
    mutationFn: useConvexMutation(api.admin.travel.upsertFlights),
  });

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setStatus("parsing");

    const text = await selectedFile.text();
    const flights = parseFlightyCSV(text);
    setParsed(flights);
    setStatus("idle");
  }

  async function handleImport() {
    if (parsed.length === 0) {
      return;
    }

    setStatus("uploading");

    const batchSize = 50;
    let totalCreated = 0;
    let totalUpdated = 0;

    for (let i = 0; i < parsed.length; i += batchSize) {
      const batch = parsed.slice(i, i + batchSize);
      const batchResult = await upsertFlights({ adminSecret, flights: batch });
      totalCreated += batchResult.created;
      totalUpdated += batchResult.updated;
    }

    setResult({ created: totalCreated, updated: totalUpdated });
    setStatus("done");
    setParsed([]);
  }

  return (
    <div>
      <h1 className="mb-4 font-semibold text-2xl">Travel Import</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Import Flighty CSV</CardTitle>
          <CardDescription>
            Upload a Flighty export CSV to import or update flight data.
            Existing flights (matched by Flighty ID) will be updated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csv">CSV File</Label>
            <Input
              accept=".csv"
              id="csv"
              type="file"
              onChange={handleFileChange}
            />
          </div>

          {parsed.length > 0 && status === "idle" && (
            <p className="text-muted-foreground text-sm">
              Found {parsed.length} flights ready to import.
            </p>
          )}

          {status === "done" && result ? (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="size-4" />
              Created {result.created}, updated {result.updated} flights.
            </div>
          ) : null}

          <Button
            disabled={parsed.length === 0 || status === "uploading"}
            onClick={handleImport}
          >
            {status === "uploading" ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Upload className="mr-1 size-4" />
            )}
            {status === "uploading" ? "Importing..." : "Import Flights"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
