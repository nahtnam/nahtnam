import { formatDuration, formatSessionTime, phaseLabels } from "../-lib/timer";
import type { CompletedSession, Phase, SessionStats } from "../-lib/timer";

type SessionHistoryProps = {
  sessions: CompletedSession[];
  stats: SessionStats;
};

export function SessionHistory(props: SessionHistoryProps) {
  const { sessions, stats } = props;
  const recentSessions = sessions.slice(-112);

  return (
    <section
      aria-labelledby="today-session-heading"
      className="mx-auto mt-10 w-full max-w-7xl border-t border-base-300 pt-6"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="route-kicker">Session log</p>
          <h2 className="heading mt-2 text-xl" id="today-session-heading">
            Today
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs tracking-[0.08em] text-base-content/60 uppercase">
            <span>{stats.focusCount} focus</span>
            <span>{stats.breakCount} breaks</span>
            <span>
              {formatDuration({ seconds: stats.focusSeconds })} of focus
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.65rem] text-base-content/50 uppercase">
          <span>1m</span>
          <span className="size-3 rounded-selector bg-success/25" />
          <span className="size-3 rounded-selector bg-success/55" />
          <span className="size-3 rounded-selector bg-success" />
          <span>1h</span>
        </div>
      </div>

      {recentSessions.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(0.9rem,1fr))] gap-1.5">
          {recentSessions.map((session) => (
            <span
              className="tooltip tooltip-top"
              data-tip={`${phaseLabels[session.phase]} · ${formatDuration({ seconds: session.completedSeconds })} · ${formatSessionTime({ isoDate: session.completedAt })}`}
              key={session.id}
            >
              <span
                aria-hidden="true"
                className={`block aspect-square min-h-3 rounded-selector ${getSessionSquareClass({ phase: session.phase, seconds: session.completedSeconds })}`}
              />
              <span className="sr-only">
                {phaseLabels[session.phase]} completed for{" "}
                {formatDuration({ seconds: session.completedSeconds })}
              </span>
            </span>
          ))}
        </div>
      ) : (
        <div className="rounded-box border border-dashed border-base-300 px-4 py-6 text-center font-mono text-xs tracking-[0.18em] text-base-content/50 uppercase">
          No completed sessions today
        </div>
      )}
    </section>
  );
}

type GetSessionSquareClassOptions = {
  phase: Phase;
  seconds: number;
};

function getSessionSquareClass(opts: GetSessionSquareClassOptions) {
  const { phase, seconds } = opts;
  const normalized = Math.max(60, Math.min(3600, seconds));
  const bucket = Math.min(4, Math.floor(((normalized - 60) / 3540) * 5));
  const focusClasses = [
    "bg-success/20",
    "bg-success/35",
    "bg-success/55",
    "bg-success/75",
    "bg-success",
  ];
  const breakClasses = [
    "bg-warning/20",
    "bg-warning/35",
    "bg-warning/55",
    "bg-warning/75",
    "bg-warning",
  ];

  const fallbackClass = phase === "focus" ? "bg-success/20" : "bg-warning/20";

  return (
    (phase === "focus" ? focusClasses[bucket] : breakClasses[bucket]) ??
    fallbackClass
  );
}
