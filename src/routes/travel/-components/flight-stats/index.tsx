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
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Flights"
          value={stats.totalFlights.toLocaleString()}
        />
        <StatCard
          label="Distance Flown"
          value={`${stats.totalDistance.toLocaleString()} mi`}
        />
        <StatCard
          label="Airports Visited"
          value={stats.uniqueAirports.toString()}
        />
        <StatCard label="Countries" value={stats.countries.toString()} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h3 className="mb-4 font-serif text-3xl tracking-[-0.02em]">
            Flights by Year
          </h3>
          <div className="space-y-2">
            {sortedYears.map(([year, count]) => (
              <div key={year} className="flex items-center gap-3">
                <span className="w-12 font-mono text-[0.76rem] text-muted-foreground uppercase">
                  {year}
                </span>
                <div className="flex-1">
                  <div
                    className="h-7 rounded-full bg-primary/12"
                    style={{
                      width: `${(count / maxYearCount) * 100}%`,
                    }}
                  >
                    <span className="flex h-full items-center px-3 font-mono text-sm text-foreground">
                      {count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 font-serif text-3xl tracking-[-0.02em]">
            Top Airlines
          </h3>
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-[1.8rem] border border-border/70 bg-background/72 p-4">
            {stats.topAirlines.map((airline) => (
              <div
                key={airline.name}
                className="flex items-center justify-between py-1"
              >
                <span className="text-sm">{airline.name}</span>
                <span className="font-mono text-muted-foreground text-sm">
                  {airline.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 font-serif text-3xl tracking-[-0.02em]">
            Most Visited Airports
          </h3>
          <div className="space-y-1 rounded-[1.8rem] border border-border/70 bg-background/72 p-4">
            {stats.topAirports.map((airport) => (
              <div
                key={airport.code}
                className="flex items-center justify-between py-1"
              >
                <span className="text-sm">
                  {airport.city}{" "}
                  <span className="text-muted-foreground">
                    ({airport.code})
                  </span>
                </span>
                <span className="font-mono text-muted-foreground text-sm">
                  {airport.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 font-serif text-3xl tracking-[-0.02em]">
            Aircraft Types
          </h3>
          <p className="mb-3 text-muted-foreground text-sm">
            {stats.aircraftTypes.length} unique aircraft types flown
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stats.aircraftTypes.map((type) => (
              <span
                key={type}
                className="rounded-full border border-border/70 bg-secondary/76 px-3 py-1 font-mono text-[0.72rem] uppercase"
              >
                {type}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h3 className="mb-4 font-serif text-3xl tracking-[-0.02em]">
          Fun Facts
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.8rem] border border-border/70 bg-background/72 p-5">
            <p className="text-muted-foreground text-sm">
              Flown around Earth approximately
            </p>
            <p className="font-serif text-4xl tracking-[-0.025em]">
              {stats.earthCircumnavigations}x
            </p>
          </div>
          <div className="rounded-[1.8rem] border border-border/70 bg-background/72 p-5">
            <p className="text-muted-foreground text-sm">
              Distance to the Moon covered
            </p>
            <p className="font-serif text-4xl tracking-[-0.025em]">
              {stats.moonPercentage}%
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

type StatCardProps = {
  readonly label: string;
  readonly value: string;
};

function StatCard(props: StatCardProps) {
  const { label, value } = props;
  return (
    <div className="rounded-[1.8rem] border border-border/70 bg-background/72 p-5">
      <p className="font-mono text-[0.7rem] text-muted-foreground uppercase tracking-[0.22em]">
        {label}
      </p>
      <p className="mt-3 font-serif text-4xl tracking-[-0.025em]">{value}</p>
    </div>
  );
}
