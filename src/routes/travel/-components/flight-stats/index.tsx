import type { TravelStats } from "../../-lib/types";

interface FlightStatsProps {
  stats: TravelStats;
}

export function FlightStats(props: FlightStatsProps) {
  const { stats } = props;

  const maxYearCount = Math.max(...Object.values(stats.flightsByYear));
  const sortedYears = Object.entries(stats.flightsByYear).sort(
    (a, b) => Number(a[0]) - Number(b[0])
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
          <h3 className="mb-4 font-semibold text-lg">Flights by Year</h3>
          <div className="space-y-2">
            {sortedYears.map(([year, count]) => (
              <div className="flex items-center gap-3" key={year}>
                <span className="w-12 font-mono text-muted-foreground text-sm">
                  {year}
                </span>
                <div className="flex-1">
                  <div
                    className="h-6 rounded bg-blue-500/20"
                    style={{
                      width: `${(count / maxYearCount) * 100}%`,
                    }}
                  >
                    <span className="flex h-full items-center px-2 font-mono text-sm">
                      {count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 font-semibold text-lg">Top Airlines</h3>
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {stats.topAirlines.map((airline) => (
              <div
                className="flex items-center justify-between py-1"
                key={airline.name}
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
          <h3 className="mb-4 font-semibold text-lg">Most Visited Airports</h3>
          <div className="space-y-1">
            {stats.topAirports.map((airport) => (
              <div
                className="flex items-center justify-between py-1"
                key={airport.code}
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
          <h3 className="mb-4 font-semibold text-lg">Aircraft Types</h3>
          <p className="mb-2 text-muted-foreground text-sm">
            {stats.aircraftTypes.length} unique aircraft types flown
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stats.aircraftTypes.map((type) => (
              <span
                className="rounded-md bg-muted px-2 py-0.5 text-xs"
                key={type}
              >
                {type}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h3 className="mb-4 font-semibold text-lg">Fun Facts</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">
              Flown around Earth approximately
            </p>
            <p className="font-bold text-2xl">
              {stats.earthCircumnavigations}x
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">
              Distance to the Moon covered
            </p>
            <p className="font-bold text-2xl">{stats.moonPercentage}%</p>
          </div>
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard(props: StatCardProps) {
  const { label, value } = props;
  return (
    <div className="rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-bold text-2xl">{value}</p>
    </div>
  );
}
