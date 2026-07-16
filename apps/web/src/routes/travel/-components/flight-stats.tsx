import { ArrowUpRightIcon } from "lucide-react";

import type { TravelStats } from "./types";

type FlightStatsProps = {
  stats: TravelStats;
};

export function FlightStats(props: FlightStatsProps) {
  const { stats } = props;
  const sortedYears: [string, number][] = [];

  for (const yearEntry of Object.entries(stats.flightsByYear)) {
    const [year] = yearEntry;
    const insertionIndex = sortedYears.findIndex(
      ([sortedYear]) => Number(year) < Number(sortedYear)
    );

    if (insertionIndex === -1) {
      sortedYears.push(yearEntry);
    } else {
      sortedYears.splice(insertionIndex, 0, yearEntry);
    }
  }
  const maxYearCount = Math.max(1, ...sortedYears.map(([, count]) => count));

  return (
    <div className="space-y-14">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <section aria-labelledby="flights-by-year-heading">
          <SectionHeading
            description="Every recorded takeoff, arranged by calendar year."
            id="flights-by-year-heading"
            title="Flights by year"
          />
          <div className="mt-6 space-y-3">
            {sortedYears.map(([year, count]) => (
              <div
                className="grid grid-cols-[3rem_minmax(0,1fr)_2rem] items-center gap-3"
                key={year}
              >
                <span className="font-mono text-xs text-base-content/60">
                  {year}
                </span>
                <progress
                  aria-label={`${count} flights in ${year}`}
                  className="progress h-2"
                  max={maxYearCount}
                  value={count}
                />
                <span className="text-right font-mono text-xs tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="aircraft-types-heading">
          <SectionHeading
            description={`${stats.aircraftTypes.length} unique aircraft types flown.`}
            id="aircraft-types-heading"
            title="Aircraft types"
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {stats.aircraftTypes.map((type) => (
              <span className="badge badge-outline font-mono" key={type}>
                {type}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <RankedList
          entries={stats.topAirlines.map((airline) => ({
            key: airline.name,
            label: airline.name,
            value: airline.count,
          }))}
          heading="Top airlines"
        />
        <RankedList
          entries={stats.topAirports.map((airport) => ({
            key: airport.code,
            label: `${airport.city} (${airport.code})`,
            value: airport.count,
          }))}
          heading="Most visited airports"
        />
      </div>
    </div>
  );
}

export function TravelSummary(props: FlightStatsProps) {
  const { stats } = props;

  return (
    <section aria-labelledby="travel-totals-heading" className="mt-5">
      <h2 className="sr-only" id="travel-totals-heading">
        Travel totals
      </h2>
      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-none lg:stats-horizontal">
        <TravelStat
          label="Total flights"
          value={stats.totalFlights.toLocaleString()}
        />
        <TravelStat
          label="Distance flown"
          value={`${stats.totalDistance.toLocaleString()} mi`}
        />
        <TravelStat
          label="Airports visited"
          value={stats.uniqueAirports.toString()}
        />
        <TravelStat label="Countries" value={stats.countries.toString()} />
      </div>
    </section>
  );
}

export function TravelScaleStats(props: FlightStatsProps) {
  const { stats } = props;

  return (
    <section
      aria-labelledby="travel-scale-heading"
      className="border-t border-base-300 pt-6 lg:min-w-[25rem] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
    >
      <h2 className="sr-only" id="travel-scale-heading">
        Travel distance comparisons
      </h2>
      <div className="stats stats-horizontal w-full bg-transparent shadow-none">
        <TravelStat
          description="Flown around Earth approximately · equivalent global laps"
          label="Earth laps"
          surface="open"
          value={`${stats.earthCircumnavigations}x`}
        />
        <TravelStat
          description="Distance to the Moon covered · one way, from Earth"
          label="Moon distance"
          surface="open"
          value={`${stats.moonPercentage}%`}
        />
      </div>
    </section>
  );
}

type TravelStatProps = {
  description?: string;
  label: string;
  surface?: "open" | "solid";
  value: string;
};

function TravelStat(props: TravelStatProps) {
  const { description, label, surface = "solid", value } = props;

  return (
    <div
      className={`stat min-w-0 ${surface === "solid" ? "bg-base-100" : "bg-transparent"}`}
    >
      <div className="stat-title font-mono text-[0.68rem] tracking-[0.16em] uppercase">
        {label}
      </div>
      <div className="stat-value mt-2 text-xl tabular-nums sm:text-2xl">
        {value}
      </div>
      {description ? (
        <div className="stat-desc mt-1 text-pretty whitespace-normal">
          {description}
        </div>
      ) : null}
    </div>
  );
}

type SectionHeadingProps = {
  description: string;
  id: string;
  title: string;
};

function SectionHeading(props: SectionHeadingProps) {
  const { description, id, title } = props;

  return (
    <div className="border-b border-base-300 pb-4">
      <p className="route-kicker">Manifest</p>
      <h2 className="heading mt-2 text-2xl" id={id}>
        {title}
      </h2>
      <p className="muted mt-2 text-sm">{description}</p>
    </div>
  );
}

type RankedEntry = {
  key: string;
  label: string;
  value: number;
};

type RankedListProps = {
  entries: RankedEntry[];
  heading: string;
};

function RankedList(props: RankedListProps) {
  const { entries, heading } = props;
  const headingId = `${heading.toLowerCase().replaceAll(" ", "-")}-heading`;

  return (
    <section aria-labelledby={headingId}>
      <div className="flex items-end justify-between gap-4 border-b border-base-300 pb-4">
        <div>
          <p className="route-kicker">Frequency</p>
          <h2 className="heading mt-2 text-2xl" id={headingId}>
            {heading}
          </h2>
        </div>
        <ArrowUpRightIcon
          aria-hidden="true"
          className="size-5 text-base-content/35"
        />
      </div>
      <ul className="list max-h-80 overflow-y-auto">
        {entries.map((entry, index) => (
          <li
            className="list-row rounded-none border-b border-base-200 px-0 py-3"
            key={entry.key}
          >
            <span className="font-mono text-xs text-base-content/35 tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="list-col-grow truncate text-sm">
              {entry.label}
            </span>
            <span className="font-mono text-sm tabular-nums">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
