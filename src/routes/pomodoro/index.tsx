import { createFileRoute } from "@tanstack/react-router";
import {
  Coffee,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  SkipForward,
  Sun,
  TimerReset,
} from "lucide-react";
import FlipClockCountdown, {
  type FlipClockCountdownState,
} from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { appUrl } from "@/lib/config";

type Phase = "focus" | "longBreak" | "shortBreak";
type Theme = "dark" | "light";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

type Settings = {
  autoStartNext: boolean;
  focusMinutes: number;
  longBreakMinutes: number;
  shortBreakMinutes: number;
  segmentsBeforeLongBreak: number;
  soundEnabled: boolean;
};

type CompletedSession = {
  completedAt: string;
  completedSeconds: number;
  id: string;
  phase: Phase;
  plannedSeconds: number;
  settingsSnapshot: Settings;
  startedAt: string;
};

type CycleItem = {
  index: number;
  phase: Phase;
  status: "current" | "done" | "up next";
};

const defaultSettings: Settings = {
  autoStartNext: false,
  focusMinutes: 25,
  longBreakMinutes: 15,
  segmentsBeforeLongBreak: 4,
  shortBreakMinutes: 5,
  soundEnabled: true,
};

const presets = [
  {
    label: "Classic",
    settings: defaultSettings,
  },
  {
    label: "Deep work",
    settings: {
      ...defaultSettings,
      focusMinutes: 50,
      longBreakMinutes: 20,
      shortBreakMinutes: 10,
    },
  },
  {
    label: "Sprint",
    settings: {
      ...defaultSettings,
      focusMinutes: 15,
      longBreakMinutes: 10,
      shortBreakMinutes: 3,
    },
  },
];

const phaseLabels: Record<Phase, string> = {
  focus: "Focus",
  longBreak: "Long break",
  shortBreak: "Short break",
};

const historyStorageKey = "pomodoro.completedSessions.v1";
const settingsStorageKey = "pomodoro.settings.v1";

const pageTitle = "Pomodoro Flip Clock | Manthan (@nahtnam)";
const pageDescription =
  "A clean Pomodoro flip clock with configurable focus sessions, short breaks, long breaks, cycle length, browser title alerts, and an alarm.";

export const Route = createFileRoute("/pomodoro/")({
  component: PomodoroPage,
  head: () => ({
    links: [
      {
        href: `${appUrl}/pomodoro`,
        rel: "canonical",
      },
    ],
    meta: [
      {
        content: pageTitle,
        title: pageTitle,
      },
      {
        content: pageDescription,
        name: "description",
      },
      {
        content:
          "pomodoro timer, flip clock, focus timer, productivity timer, work timer",
        name: "keywords",
      },
      {
        content: "index, follow",
        name: "robots",
      },
      {
        content: "light dark",
        name: "color-scheme",
      },
      {
        content: `${appUrl}/pomodoro`,
        property: "og:url",
      },
      {
        content: "website",
        property: "og:type",
      },
      {
        content: pageTitle,
        property: "og:title",
      },
      {
        content: pageDescription,
        property: "og:description",
      },
      {
        content: `${appUrl}/assets/images/me.avif`,
        property: "og:image",
      },
      {
        content: "summary_large_image",
        name: "twitter:card",
      },
      {
        content: pageTitle,
        name: "twitter:title",
      },
      {
        content: pageDescription,
        name: "twitter:description",
      },
      {
        content: `${appUrl}/assets/images/me.avif`,
        name: "twitter:image",
      },
    ],
  }),
});

function PomodoroPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [theme, setTheme] = useState<Theme>("light");
  const [phase, setPhase] = useState<Phase>("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(
    defaultSettings.focusMinutes * 60,
  );
  const [targetEndAt, setTargetEndAt] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSegments, setCompletedSegments] = useState(0);
  const [lastCompletedPhase, setLastCompletedPhase] = useState<Phase>();
  const [sessionLog, setSessionLog] = useState<CompletedSession[]>([]);
  const [sessionLogLoaded, setSessionLogLoaded] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<number>();
  const [todayKey, setTodayKey] = useState(() =>
    getLocalDateKey({ date: new Date() }),
  );
  const titleRef = useRef<string | undefined>(undefined);

  const totalSeconds = useMemo(
    () => getPhaseSeconds({ phase, settings }),
    [phase, settings],
  );
  const progress = Math.max(
    0,
    Math.min(1, (totalSeconds - remainingSeconds) / totalSeconds),
  );
  const nextPhase = useMemo(
    () =>
      getNextPhase({
        completedFocusCount:
          phase === "focus" ? completedSegments + 1 : completedSegments,
        phase,
        segmentsBeforeLongBreak: settings.segmentsBeforeLongBreak,
      }),
    [completedSegments, phase, settings.segmentsBeforeLongBreak],
  );
  const cycleItems = useMemo(
    () =>
      getCycleItems({
        completedSegments,
        currentPhase: phase,
        segmentsBeforeLongBreak: settings.segmentsBeforeLongBreak,
      }),
    [completedSegments, phase, settings.segmentsBeforeLongBreak],
  );
  const todaysSessions = useMemo(
    () =>
      getSessionsCompletedOnDate({
        dateKey: todayKey,
        sessions: sessionLog,
      }),
    [sessionLog, todayKey],
  );
  const stats = useMemo(
    () => getSessionStats({ sessions: todaysSessions }),
    [todaysSessions],
  );

  useEffect(() => {
    if (globalThis.window === undefined) {
      return;
    }

    setTheme(
      globalThis.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
    );
  }, []);

  useEffect(() => {
    const intervalId = globalThis.setInterval(() => {
      setTodayKey(getLocalDateKey({ date: new Date() }));
    }, 60_000);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const storedSettings = readStoredSettings();

    if (storedSettings) {
      setSettings(storedSettings);
      setRemainingSeconds(
        getPhaseSeconds({ phase: "focus", settings: storedSettings }),
      );
    }

    setSessionLogLoaded(true);
    setSettingsLoaded(true);
    setSessionLog(readStoredSessionLog());
  }, []);

  useEffect(() => {
    if (!sessionLogLoaded || globalThis.window === undefined) {
      return;
    }

    globalThis.window.localStorage.setItem(
      historyStorageKey,
      JSON.stringify(sessionLog),
    );
  }, [sessionLog, sessionLogLoaded]);

  useEffect(() => {
    if (!settingsLoaded || globalThis.window === undefined) {
      return;
    }

    globalThis.window.localStorage.setItem(
      settingsStorageKey,
      JSON.stringify(settings),
    );
  }, [settings, settingsLoaded]);

  useEffect(() => {
    if (globalThis.document === undefined) {
      return;
    }

    titleRef.current ??= globalThis.document.title;

    if (lastCompletedPhase && !isRunning) {
      globalThis.document.title = `${phaseLabels[lastCompletedPhase]} done - Pomodoro`;
      return;
    }

    if (isRunning) {
      globalThis.document.title = `${formatClock({ seconds: remainingSeconds })} - ${phaseLabels[phase]}`;
      return;
    }

    globalThis.document.title = pageTitle;

    return () => {
      globalThis.document.title = titleRef.current ?? pageTitle;
    };
  }, [isRunning, lastCompletedPhase, phase, remainingSeconds]);

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      setSettings((current) => {
        const next = normalizeSettings({
          settings: { ...current, ...partial },
        });
        setRemainingSeconds(getPhaseSeconds({ phase, settings: next }));
        setTargetEndAt(0);
        setIsRunning(false);
        setLastCompletedPhase(undefined);
        setSessionStartedAt(undefined);
        return next;
      });
    },
    [phase],
  );

  const applyPreset = useCallback((nextSettings: Settings) => {
    const normalized = normalizeSettings({ settings: nextSettings });
    setSettings(normalized);
    setPhase("focus");
    setRemainingSeconds(
      getPhaseSeconds({ phase: "focus", settings: normalized }),
    );
    setTargetEndAt(0);
    setCompletedSegments(0);
    setIsRunning(false);
    setLastCompletedPhase(undefined);
    setSessionStartedAt(undefined);
  }, []);

  const advancePhase = useCallback(
    (props: { readonly shouldRing: boolean }) => {
      const { shouldRing } = props;

      if (shouldRing && settings.soundEnabled) {
        ringAlarm();
      }

      const completedFocusCount =
        phase === "focus" ? completedSegments + 1 : completedSegments;
      const nextPhase = getNextPhase({
        completedFocusCount,
        phase,
        segmentsBeforeLongBreak: settings.segmentsBeforeLongBreak,
      });

      setCompletedSegments(completedFocusCount);
      setPhase(nextPhase);
      const nextSeconds = getPhaseSeconds({ phase: nextPhase, settings });
      setRemainingSeconds(nextSeconds);
      setTargetEndAt(
        settings.autoStartNext ? Date.now() + nextSeconds * 1000 : 0,
      );
      setIsRunning(settings.autoStartNext);
      setSessionStartedAt(settings.autoStartNext ? Date.now() : undefined);
    },
    [completedSegments, phase, settings],
  );

  const completePhase = useCallback(() => {
    const completedAt = Date.now();
    const plannedSeconds = getPhaseSeconds({ phase, settings });
    const startedAt = sessionStartedAt ?? completedAt - plannedSeconds * 1000;

    setSessionLog((current) => [
      ...current,
      {
        completedAt: new Date(completedAt).toISOString(),
        completedSeconds: plannedSeconds,
        id: `${completedAt}-${phase}-${current.length}`,
        phase,
        plannedSeconds,
        settingsSnapshot: settings,
        startedAt: new Date(startedAt).toISOString(),
      },
    ]);
    setLastCompletedPhase(phase);
    if (settings.soundEnabled) {
      ringAlarm();
    }

    advancePhase({ shouldRing: false });
  }, [advancePhase, phase, sessionStartedAt, settings]);

  const resetTimer = useCallback(() => {
    setRemainingSeconds(getPhaseSeconds({ phase, settings }));
    setTargetEndAt(0);
    setIsRunning(false);
    setLastCompletedPhase(undefined);
    setSessionStartedAt(undefined);
  }, [phase, settings]);

  const skipPhase = useCallback(() => {
    setIsRunning(false);
    setTargetEndAt(0);
    setSessionStartedAt(undefined);
    advancePhase({ shouldRing: false });
  }, [advancePhase]);

  const handleTimerToggle = useCallback(() => {
    setLastCompletedPhase(undefined);
    if (isRunning) {
      const liveRemainingSeconds =
        targetEndAt > 0
          ? Math.max(0, Math.ceil((targetEndAt - Date.now()) / 1000))
          : remainingSeconds;
      setRemainingSeconds(liveRemainingSeconds);
      setTargetEndAt(0);
      setIsRunning(false);
      return;
    }

    if (remainingSeconds <= 0) {
      return;
    }

    setTargetEndAt(Date.now() + remainingSeconds * 1000);
    setSessionStartedAt((current) => current ?? Date.now());
    setIsRunning(true);
  }, [isRunning, remainingSeconds, targetEndAt]);

  const handleClockTick = useCallback((state: FlipClockCountdownState) => {
    setRemainingSeconds(state.timeDelta.total);
  }, []);

  const handleClockComplete = useCallback(() => {
    if (!isRunning) {
      return;
    }

    completePhase();
  }, [completePhase, isRunning]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const primaryActionLabel = isRunning ? "Pause" : "Start";
  const PrimaryActionIcon = isRunning ? Pause : Play;
  return (
    <div
      className={
        theme === "dark"
          ? "dark min-h-screen bg-zinc-950 text-zinc-100"
          : "min-h-screen bg-background text-foreground"
      }
    >
      <div className="flex min-h-screen w-full flex-col px-3 py-3 md:px-5 md:py-4">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <h1 className="font-serif text-4xl tracking-[-0.03em] md:text-5xl">
            Pomodoro
          </h1>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Toggle color mode"
                  className={
                    theme === "dark"
                      ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                      : undefined
                  }
                  size="icon"
                  type="button"
                  variant="outline"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>

            <Sheet>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SheetTrigger asChild>
                    <Button
                      aria-label="Open Pomodoro settings"
                      className={
                        theme === "dark"
                          ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                          : undefined
                      }
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      <SettingsIcon className="size-4" />
                    </Button>
                  </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>

              <SheetContent
                className={
                  theme === "dark"
                    ? "border-zinc-800 bg-zinc-950 text-zinc-100"
                    : undefined
                }
              >
                <SheetHeader className="border-b border-border/70 px-6 py-5">
                  <SheetTitle
                    className={
                      theme === "dark" ? "text-zinc-100" : "text-foreground"
                    }
                  >
                    Settings
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6">
                  <div className="grid grid-cols-3 gap-2">
                    {presets.map((preset) => (
                      <Button
                        key={preset.label}
                        className={
                          theme === "dark"
                            ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                            : undefined
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() => {
                          applyPreset(preset.settings);
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-5">
                    <NumberField
                      label="Focus"
                      max={120}
                      min={1}
                      suffix="min"
                      value={settings.focusMinutes}
                      onChange={(value) => {
                        updateSettings({ focusMinutes: value });
                      }}
                    />
                    <NumberField
                      label="Short break"
                      max={60}
                      min={1}
                      suffix="min"
                      value={settings.shortBreakMinutes}
                      onChange={(value) => {
                        updateSettings({ shortBreakMinutes: value });
                      }}
                    />
                    <NumberField
                      label="Long break"
                      max={90}
                      min={1}
                      suffix="min"
                      value={settings.longBreakMinutes}
                      onChange={(value) => {
                        updateSettings({ longBreakMinutes: value });
                      }}
                    />
                    <NumberField
                      label="Cycles"
                      max={12}
                      min={1}
                      suffix="blocks"
                      value={settings.segmentsBeforeLongBreak}
                      onChange={(value) => {
                        updateSettings({ segmentsBeforeLongBreak: value });
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <ToggleRow
                      description="Start the next timer automatically."
                      isChecked={settings.autoStartNext}
                      label="Auto-start"
                      onCheckedChange={(checked) => {
                        updateSettings({ autoStartNext: checked });
                      }}
                    />
                    <ToggleRow
                      description="Ring when a timer reaches zero."
                      isChecked={settings.soundEnabled}
                      label="Alarm"
                      onCheckedChange={(checked) => {
                        updateSettings({ soundEnabled: checked });
                      }}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-2">
          <section className="w-full">
            <div className="mx-auto mb-3 flex w-full max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <StatePill label="Current" phase={phase} />
                <StatePill label="Next" phase={nextPhase} />
              </div>

              <div className="flex items-center gap-1.5">
                {cycleItems.map((item) => (
                  <Tooltip key={item.index}>
                    <TooltipTrigger asChild>
                      <span
                        aria-label={`${phaseLabels[item.phase]} ${item.status}`}
                        className={getCycleSquareClass({ item, theme })}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {phaseLabels[item.phase]} · {item.status}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            <FlipClock
              isRunning={isRunning}
              remainingSeconds={remainingSeconds}
              targetEndAt={targetEndAt}
              theme={theme}
              onComplete={handleClockComplete}
              onTick={handleClockTick}
            />

            <div className="mx-auto mt-5 h-1 max-w-7xl overflow-hidden rounded-full bg-current/10">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <div className="mx-auto mt-6 flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                className="h-11 min-w-36 text-sm"
                type="button"
                onClick={handleTimerToggle}
              >
                <PrimaryActionIcon className="size-4" />
                {primaryActionLabel}
              </Button>
              <Button
                className={
                  theme === "dark"
                    ? "h-11 border-zinc-700 bg-zinc-950/40 text-zinc-100 hover:bg-zinc-800"
                    : "h-11"
                }
                type="button"
                variant="outline"
                onClick={resetTimer}
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button
                className={
                  theme === "dark"
                    ? "h-11 border-zinc-700 bg-zinc-950/40 text-zinc-100 hover:bg-zinc-800"
                    : "h-11"
                }
                type="button"
                variant="outline"
                onClick={skipPhase}
              >
                <SkipForward className="size-4" />
                Skip
              </Button>
            </div>

            <SessionHistory
              sessions={todaysSessions}
              stats={stats}
              theme={theme}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

function FlipClock(props: {
  readonly isRunning: boolean;
  readonly onComplete: () => void;
  readonly onTick: (state: FlipClockCountdownState) => void;
  readonly remainingSeconds: number;
  readonly targetEndAt: number;
  readonly theme: Theme;
}) {
  const {
    isRunning,
    onComplete,
    onTick,
    remainingSeconds,
    targetEndAt,
    theme,
  } = props;
  const clockTarget = isRunning ? targetEndAt : remainingSeconds * 1000;
  const digitBackground = theme === "dark" ? "#09090b" : "#f5f5f4";
  const digitColor = theme === "dark" ? "#f5f5f4" : "#1c1917";
  const dividerColor = theme === "dark" ? "#000000" : "#d6d3d1";

  return (
    <div className="pomodoro-flip-clock-wrap flex w-full justify-center">
      <FlipClockCountdown
        daysInHours
        renderOnServer
        showLabels
        showSeparators
        stopOnHiddenVisibility
        className="pomodoro-flip-clock"
        digitBlockStyle={{
          background: digitBackground,
          borderRadius: 12,
          boxShadow:
            theme === "dark"
              ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 24px 46px -32px rgba(0,0,0,0.9)"
              : "inset 0 1px 0 rgba(255,255,255,0.88), 0 24px 46px -34px rgba(28,25,23,0.45)",
          color: digitColor,
          fontSize: "clamp(5.4rem, 18vw, 18.5rem)",
          height: "clamp(8rem, 27vw, 24rem)",
          width: "clamp(5.15rem, 23vw, 21rem)",
        }}
        dividerStyle={{
          color: dividerColor,
          height: 1,
        }}
        duration={0.7}
        hideOnComplete={false}
        labelStyle={{
          color: "currentColor",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
        }}
        labels={["", "", "Minutes", "Seconds"]}
        now={isRunning ? Date.now : () => 0}
        renderMap={[false, false, true, true]}
        separatorStyle={{
          color: "currentColor",
          size: "clamp(0.62rem, 1.5vw, 1.25rem)",
        }}
        spacing={{
          clock: "clamp(0.4rem, 1vw, 1.15rem)",
          digitBlock: "clamp(0.2rem, 0.35vw, 0.44rem)",
        }}
        to={clockTarget}
        onComplete={onComplete}
        onTick={onTick}
      />
    </div>
  );
}

function StatePill(props: { readonly label: string; readonly phase: Phase }) {
  const { label, phase } = props;
  const Icon = phase === "focus" ? TimerReset : Coffee;

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-current/15 bg-current/[0.04] px-3 py-1.5 font-mono text-[0.66rem] tracking-[0.18em] uppercase">
      <span className="opacity-50">{label}</span>
      <Icon className="size-3.5" />
      {phaseLabels[phase]}
    </div>
  );
}

function SessionHistory(props: {
  readonly sessions: CompletedSession[];
  readonly stats: ReturnType<typeof getSessionStats>;
  readonly theme: Theme;
}) {
  const { sessions, stats, theme } = props;
  const recentSessions = sessions.slice(-112);

  return (
    <div className="mx-auto mt-7 w-full max-w-7xl border-t border-current/10 pt-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.24em] opacity-65">
            Today
          </h2>
          <div className="mt-2 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-[0.18em]">
            <span>{stats.focusCount} focus</span>
            <span>{stats.breakCount} breaks</span>
            <span>
              {formatDuration({ seconds: stats.focusSeconds })} of focus
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] opacity-60">
          <span>1m</span>
          <span className="size-3 rounded-[3px] bg-emerald-200" />
          <span className="size-3 rounded-[3px] bg-emerald-500" />
          <span className="size-3 rounded-[3px] bg-emerald-800" />
          <span>1h</span>
        </div>
      </div>

      {recentSessions.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(0.9rem,1fr))] gap-1.5">
          {recentSessions.map((session) => (
            <Tooltip key={session.id}>
              <TooltipTrigger asChild>
                <span
                  aria-label={`${phaseLabels[session.phase]} completed for ${formatDuration({ seconds: session.completedSeconds })}`}
                  className="aspect-square min-h-3 rounded-[3px] ring-1 ring-black/5"
                  style={{
                    backgroundColor: getSessionSquareColor({
                      phase: session.phase,
                      seconds: session.completedSeconds,
                      theme,
                    }),
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                {phaseLabels[session.phase]} ·{" "}
                {formatDuration({ seconds: session.completedSeconds })} ·{" "}
                {formatSessionTime({ isoDate: session.completedAt })}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-current/20 px-4 py-5 text-center font-mono text-xs uppercase tracking-[0.2em] opacity-55">
          No completed sessions today
        </div>
      )}
    </div>
  );
}

function NumberField(props: {
  readonly label: string;
  readonly max: number;
  readonly min: number;
  readonly onChange: (value: number) => void;
  readonly suffix: string;
  readonly value: number;
}) {
  const { label, max, min, onChange, suffix, value } = props;

  return (
    <div className="grid gap-2">
      <Label className="font-mono text-xs uppercase tracking-[0.2em] opacity-65">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          className="border-current/20 bg-current/[0.04] font-mono text-current shadow-none"
          max={max}
          min={min}
          type="number"
          value={value}
          onChange={(event) => {
            onChange(Number(event.target.value));
          }}
        />
        <span className="w-16 shrink-0 font-mono text-xs uppercase opacity-55">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function ToggleRow(props: {
  readonly description: string;
  readonly isChecked: boolean;
  readonly label: string;
  readonly onCheckedChange: (checked: boolean) => void;
}) {
  const { description, isChecked, label, onCheckedChange } = props;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-current/15 bg-current/[0.035] p-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-sm leading-5 opacity-60">{description}</p>
      </div>
      <Switch checked={isChecked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function getPhaseSeconds(props: {
  readonly phase: Phase;
  readonly settings: Settings;
}) {
  const { phase, settings } = props;

  if (phase === "focus") {
    return settings.focusMinutes * 60;
  }

  if (phase === "longBreak") {
    return settings.longBreakMinutes * 60;
  }

  return settings.shortBreakMinutes * 60;
}

function getNextPhase(props: {
  readonly completedFocusCount: number;
  readonly phase: Phase;
  readonly segmentsBeforeLongBreak: number;
}) {
  const { completedFocusCount, phase, segmentsBeforeLongBreak } = props;

  if (phase !== "focus") {
    return "focus";
  }

  if (completedFocusCount % segmentsBeforeLongBreak === 0) {
    return "longBreak";
  }

  return "shortBreak";
}

function getCycleItems(props: {
  readonly completedSegments: number;
  readonly currentPhase: Phase;
  readonly segmentsBeforeLongBreak: number;
}): CycleItem[] {
  const { completedSegments, currentPhase, segmentsBeforeLongBreak } = props;
  const rawFocusInCycle = completedSegments % segmentsBeforeLongBreak;
  const focusInCycle =
    currentPhase !== "focus" && rawFocusInCycle === 0 && completedSegments > 0
      ? segmentsBeforeLongBreak
      : rawFocusInCycle;
  const currentIndex =
    currentPhase === "focus"
      ? focusInCycle * 2
      : Math.max(0, focusInCycle * 2 - 1);

  return Array.from({ length: segmentsBeforeLongBreak * 2 }, (_, index) => {
    const isFocus = index % 2 === 0;
    const isLastBreak = index === segmentsBeforeLongBreak * 2 - 1;
    const phase = isFocus ? "focus" : isLastBreak ? "longBreak" : "shortBreak";

    return {
      index,
      phase,
      status:
        index < currentIndex
          ? "done"
          : index === currentIndex
            ? "current"
            : "up next",
    };
  });
}

function getCycleSquareClass(props: {
  readonly item: CycleItem;
  readonly theme: Theme;
}) {
  const { item, theme } = props;
  const isBreak = item.phase !== "focus";
  const base =
    "block size-4 rounded-[4px] ring-1 transition-transform hover:scale-125";
  const statusClass =
    item.status === "current"
      ? "ring-2 ring-current"
      : item.status === "done"
        ? "opacity-95"
        : "opacity-35";
  const lightColor = isBreak
    ? "bg-amber-300 ring-amber-700/20"
    : "bg-emerald-300 ring-emerald-700/20";
  const darkColor = isBreak
    ? "bg-amber-400 ring-amber-200/20"
    : "bg-emerald-400 ring-emerald-200/20";

  return `${base} ${statusClass} ${theme === "dark" ? darkColor : lightColor}`;
}

function getSessionStats(props: { readonly sessions: CompletedSession[] }) {
  const { sessions } = props;
  const focusCount = sessions.filter(
    (session) => session.phase === "focus",
  ).length;
  const breakCount = sessions.length - focusCount;
  let focusSeconds = 0;
  let totalSeconds = 0;

  for (const session of sessions) {
    totalSeconds += session.completedSeconds;

    if (session.phase === "focus") {
      focusSeconds += session.completedSeconds;
    }
  }

  return {
    breakCount,
    focusCount,
    focusSeconds,
    totalSeconds,
  };
}

function getSessionsCompletedOnDate(props: {
  readonly dateKey: string;
  readonly sessions: CompletedSession[];
}) {
  const { dateKey, sessions } = props;

  return sessions.filter((session) => {
    const completedAt = new Date(session.completedAt);

    if (Number.isNaN(completedAt.getTime())) {
      return false;
    }

    return getLocalDateKey({ date: completedAt }) === dateKey;
  });
}

function getLocalDateKey(props: { readonly date: Date }) {
  const { date } = props;
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function getSessionSquareColor(props: {
  readonly phase: Phase;
  readonly seconds: number;
  readonly theme: Theme;
}) {
  const { phase, seconds, theme } = props;
  const normalized = Math.max(60, Math.min(3600, seconds));
  const bucket = Math.min(4, Math.floor(((normalized - 60) / 3540) * 5));
  const focusColors =
    theme === "dark"
      ? ["#bbf7d0", "#86efac", "#4ade80", "#16a34a", "#166534"]
      : ["#dcfce7", "#bbf7d0", "#86efac", "#22c55e", "#15803d"];
  const breakColors =
    theme === "dark"
      ? ["#fef3c7", "#fde68a", "#facc15", "#d97706", "#92400e"]
      : ["#fef9c3", "#fde68a", "#facc15", "#eab308", "#a16207"];

  return phase === "focus" ? focusColors[bucket] : breakColors[bucket];
}

function readStoredSessionLog() {
  if (globalThis.window === undefined) {
    return [];
  }

  const storedValue = globalThis.window.localStorage.getItem(historyStorageKey);
  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((value): value is CompletedSession =>
      isCompletedSession(value),
    );
  } catch {
    return [];
  }
}

function readStoredSettings() {
  if (globalThis.window === undefined) {
    return;
  }

  const storedValue =
    globalThis.window.localStorage.getItem(settingsStorageKey);
  if (!storedValue) {
    return;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isSettings(parsedValue)) {
      return;
    }

    return normalizeSettings({ settings: parsedValue });
  } catch {}
}

function isCompletedSession(value: unknown): value is CompletedSession {
  if (!isRecord(value) || !isPhase(value.phase)) {
    return false;
  }

  return (
    typeof value.completedAt === "string" &&
    typeof value.completedSeconds === "number" &&
    typeof value.id === "string" &&
    typeof value.plannedSeconds === "number" &&
    isSettings(value.settingsSnapshot) &&
    typeof value.startedAt === "string"
  );
}

function isSettings(value: unknown): value is Settings {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.autoStartNext === "boolean" &&
    typeof value.focusMinutes === "number" &&
    typeof value.longBreakMinutes === "number" &&
    typeof value.segmentsBeforeLongBreak === "number" &&
    typeof value.shortBreakMinutes === "number" &&
    typeof value.soundEnabled === "boolean"
  );
}

function isPhase(value: unknown): value is Phase {
  return value === "focus" || value === "longBreak" || value === "shortBreak";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeSettings(props: { readonly settings: Settings }) {
  const { settings } = props;

  return {
    autoStartNext: settings.autoStartNext,
    focusMinutes: clamp({
      max: 120,
      min: 1,
      value: settings.focusMinutes,
    }),
    longBreakMinutes: clamp({
      max: 90,
      min: 1,
      value: settings.longBreakMinutes,
    }),
    segmentsBeforeLongBreak: clamp({
      max: 12,
      min: 1,
      value: settings.segmentsBeforeLongBreak,
    }),
    shortBreakMinutes: clamp({
      max: 60,
      min: 1,
      value: settings.shortBreakMinutes,
    }),
    soundEnabled: settings.soundEnabled,
  };
}

function clamp(props: {
  readonly max: number;
  readonly min: number;
  readonly value: number;
}) {
  const { max, min, value } = props;

  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function formatClock(props: { readonly seconds: number }) {
  const { seconds } = props;
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function formatDuration(props: { readonly seconds: number }) {
  const { seconds } = props;
  if (seconds <= 0) {
    return "0m";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${Math.max(1, minutes)}m`;
}

function formatSessionTime(props: { readonly isoDate: string }) {
  const { isoDate } = props;
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ringAlarm() {
  if (globalThis.window === undefined) {
    return;
  }

  const audioWindow = globalThis.window as AudioWindow;
  const AudioContextCtor =
    audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }

  const audioContext = new AudioContextCtor();
  const now = audioContext.currentTime;
  const frequencies = [880, 660, 990];

  for (const [index, frequency] of frequencies.entries()) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = now + index * 0.22;

    oscillator.frequency.value = frequency;
    oscillator.type = "triangle";
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.2);
  }

  globalThis.setTimeout(() => {
    void audioContext.close();
  }, 900);
}
