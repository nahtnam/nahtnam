import type { TravelStats } from "@/lib/travel/types";

type FlightStatsProps = {
  readonly stats: TravelStats;
};

export function FlightStats(props: FlightStatsProps) {
  const { stats } = props;

  const maxYearCount = Math.max(...Object.values(stats.flightsByYear));
  const sortedYears = Object.entries(stats.flightsByYear).sort(
    (a, b) => Number(a[0]) - Number(b[0]),
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
        <StatTile
          label="Total Flights"
          value={stats.totalFlights.toLocaleString()}
        />
        <StatTile
          label="Distance Flown"
          value={`${stats.totalDistance.toLocaleString()} mi`}
        />
        <StatTile
          label="Airports Visited"
          value={stats.uniqueAirports.toString()}
        />
        <StatTile label="Countries" value={stats.countries.toString()} />
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <section>
          <h3 className="mb-5 font-mono text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Flights by Year
          </h3>
          <div className="space-y-2.5">
            {sortedYears.map(([year, count]) => (
              <div key={year} className="flex items-center gap-3">
                <span className="w-10 font-mono text-[0.7rem] text-muted-foreground">
                  {year}
                </span>
                <div className="h-6 flex-1 overflow-hidden rounded-md bg-muted">
                  <div
                    className="flex h-full items-center justify-end rounded-md bg-primary pr-2 font-mono text-[0.7rem] font-medium text-primary-foreground transition-all"
                    style={{
                      width: `${Math.max(8, (count / maxYearCount) * 100)}%`,
                    }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-5 font-mono text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Aircraft Types
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">
            {stats.aircraftTypes.length} unique aircraft types flown
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stats.aircraftTypes.map((type) => (
              <span
                key={type}
                className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[0.66rem] tracking-wide text-muted-foreground"
              >
                {type}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <section>
          <h3 className="mb-5 font-mono text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Top Airlines
          </h3>
          <div className="max-h-72 divide-y divide-border overflow-y-auto overflow-x-hidden rounded-xl border border-border">
            {stats.topAirlines.map((airline) => (
              <div
                key={airline.name}
                className="flex items-center justify-between bg-card px-4 py-2.5"
              >
                <span className="truncate text-sm">{airline.name}</span>
                <span className="ml-3 shrink-0 font-mono text-sm text-muted-foreground">
                  {airline.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-5 font-mono text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Most Visited Airports
          </h3>
          <div className="max-h-72 divide-y divide-border overflow-y-auto overflow-x-hidden rounded-xl border border-border">
            {stats.topAirports.map((airport) => (
              <div
                key={airport.code}
                className="flex items-center justify-between bg-card px-4 py-2.5"
              >
                <span className="truncate text-sm">
                  {airport.city}{" "}
                  <span className="text-muted-foreground">
                    ({airport.code})
                  </span>
                </span>
                <span className="ml-3 shrink-0 font-mono text-sm text-muted-foreground">
                  {airport.count}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h3 className="mb-5 font-mono text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Fun Facts
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Flown around Earth approximately
            </p>
            <p className="mt-1 font-serif text-5xl tracking-[-0.03em] text-primary">
              {stats.earthCircumnavigations}x
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Distance to the Moon covered
            </p>
            <p className="mt-1 font-serif text-5xl tracking-[-0.03em] text-primary">
              {stats.moonPercentage}%
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

type StatTileProps = {
  readonly label: string;
  readonly value: string;
};

function StatTile(props: StatTileProps) {
  const { label, value } = props;
  return (
    <div className="bg-card p-5">
      <p className="font-mono text-[0.62rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-3 font-serif text-4xl tracking-[-0.025em]">{value}</p>
    </div>
  );
}
