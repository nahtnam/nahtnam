import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import type { FlipClockCountdownState } from "@leenguyen/react-flip-clock-countdown";

import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import {
  CoffeeIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SkipForwardIcon,
  SunIcon,
  TimerResetIcon,
} from "lucide-react";
import {
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { CSSProperties } from "react";

import {
  defaultSettings,
  formatClock,
  getCycleItems,
  getLocalDateKey,
  getNextPhase,
  getPhaseSeconds,
  getSessionsCompletedOnDate,
  getSessionStats,
  historyStorageKey,
  normalizeSettings,
  phaseLabels,
  readStoredSessionLog,
  readStoredSettings,
  ringAlarm,
  settingsStorageKey,
} from "../-lib/timer";
import type {
  CompletedSession,
  CycleItem,
  Phase,
  SessionStats,
  Settings,
  Theme,
} from "../-lib/timer";
import { SessionHistory } from "./session-history";
import { SettingsDialog } from "./settings-dialog";

const pageTitle = "Pomodoro Flip Clock | Manthan (@nahtnam)";

const darkThemeStyle = {
  "--color-base-100": "oklch(16% 0.015 255)",
  "--color-base-200": "oklch(20% 0.015 255)",
  "--color-base-300": "oklch(27% 0.015 255)",
  "--color-base-content": "oklch(94% 0.01 255)",
  "--color-neutral": "oklch(88% 0.012 255)",
  "--color-neutral-content": "oklch(18% 0.015 255)",
  colorScheme: "dark",
} as CSSProperties;

type TimerState = {
  completedSegments: number;
  isRunning: boolean;
  lastCompletedPhase: Phase | null;
  phase: Phase;
  remainingSeconds: number;
  sessionLog: CompletedSession[];
  settings: Settings;
  targetEndAt: number;
};

type TimerAction =
  | { partial: Partial<Settings>; type: "update-settings" }
  | { settings: Settings; type: "apply-preset" }
  | { now: number; type: "advance" }
  | { completedAt: number; startedAt: number; type: "complete" }
  | { type: "reset" }
  | { now: number; type: "toggle" }
  | { remainingSeconds: number; type: "tick" };

export function TimerConsole() {
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isClient) {
    return <TimerLoading />;
  }

  return <TimerConsoleApp />;
}

function TimerConsoleApp() {
  const [state, dispatch] = useReducer(
    timerReducer,
    undefined,
    createInitialTimerState
  );
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [todayKey, setTodayKey] = useState(() =>
    getLocalDateKey({ date: new Date() })
  );
  const originalTitleRef = useRef<string | null>(null);
  const sessionStartedAtRef = useRef<number | null>(null);
  const totalSeconds = getPhaseSeconds({
    phase: state.phase,
    settings: state.settings,
  });
  const progress = Math.max(
    0,
    Math.min(1, (totalSeconds - state.remainingSeconds) / totalSeconds)
  );
  const nextPhase = getNextPhase({
    completedFocusCount:
      state.phase === "focus"
        ? state.completedSegments + 1
        : state.completedSegments,
    phase: state.phase,
    segmentsBeforeLongBreak: state.settings.segmentsBeforeLongBreak,
  });
  const cycleItems = getCycleItems({
    completedSegments: state.completedSegments,
    currentPhase: state.phase,
    segmentsBeforeLongBreak: state.settings.segmentsBeforeLongBreak,
  });
  const todaysSessions = getSessionsCompletedOnDate({
    dateKey: todayKey,
    sessions: state.sessionLog,
  });
  const stats = getSessionStats({ sessions: todaysSessions });

  useEffect(() => {
    const intervalId = globalThis.setInterval(() => {
      setTodayKey(getLocalDateKey({ date: new Date() }));
    }, 60_000);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    globalThis.window.localStorage.setItem(
      historyStorageKey,
      JSON.stringify(state.sessionLog)
    );
  }, [state.sessionLog]);

  useEffect(() => {
    globalThis.window.localStorage.setItem(
      settingsStorageKey,
      JSON.stringify(state.settings)
    );
  }, [state.settings]);

  useEffect(() => {
    originalTitleRef.current ??= globalThis.document.title;

    return () => {
      globalThis.document.title = originalTitleRef.current ?? pageTitle;
    };
  }, []);

  useEffect(() => {
    globalThis.document.title = getDocumentTitle({ state });
  }, [state]);

  function updateSettings(partial: Partial<Settings>) {
    sessionStartedAtRef.current = null;
    dispatch({ partial, type: "update-settings" });
  }

  function applyPreset(settings: Settings) {
    sessionStartedAtRef.current = null;
    dispatch({ settings, type: "apply-preset" });
  }

  function resetTimer() {
    sessionStartedAtRef.current = null;
    dispatch({ type: "reset" });
  }

  function skipPhase() {
    const now = Date.now();
    sessionStartedAtRef.current = state.settings.autoStartNext ? now : null;
    dispatch({ now, type: "advance" });
  }

  function handleTimerToggle() {
    const now = Date.now();

    if (!state.isRunning && state.remainingSeconds > 0) {
      sessionStartedAtRef.current ??= now;
    }

    dispatch({ now, type: "toggle" });
  }

  function handleClockTick(clockState: FlipClockCountdownState) {
    dispatch({
      remainingSeconds: clockState.timeDelta.total,
      type: "tick",
    });
  }

  function handleClockComplete() {
    if (!state.isRunning) {
      return;
    }

    const completedAt = Date.now();
    const plannedSeconds = getPhaseSeconds({
      phase: state.phase,
      settings: state.settings,
    });
    const startedAt =
      sessionStartedAtRef.current ?? completedAt - plannedSeconds * 1000;

    dispatch({ completedAt, startedAt, type: "complete" });
    sessionStartedAtRef.current = state.settings.autoStartNext
      ? completedAt
      : null;

    if (state.settings.soundEnabled) {
      ringAlarm();
    }
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  return (
    <TimerPage
      cycleItems={cycleItems}
      nextPhase={nextPhase}
      progress={progress}
      state={state}
      stats={stats}
      theme={theme}
      todaysSessions={todaysSessions}
      onApplyPreset={applyPreset}
      onClockComplete={handleClockComplete}
      onClockTick={handleClockTick}
      onReset={resetTimer}
      onSkip={skipPhase}
      onTimerToggle={handleTimerToggle}
      onToggleTheme={toggleTheme}
      onUpdateSettings={updateSettings}
    />
  );
}

type TimerPageProps = {
  cycleItems: CycleItem[];
  nextPhase: Phase;
  onApplyPreset: (settings: Settings) => void;
  onClockComplete: () => void;
  onClockTick: (state: FlipClockCountdownState) => void;
  onReset: () => void;
  onSkip: () => void;
  onTimerToggle: () => void;
  onToggleTheme: () => void;
  onUpdateSettings: (settings: Partial<Settings>) => void;
  progress: number;
  state: TimerState;
  stats: SessionStats;
  theme: Theme;
  todaysSessions: CompletedSession[];
};

function TimerPage(props: TimerPageProps) {
  const {
    cycleItems,
    nextPhase,
    onApplyPreset,
    onClockComplete,
    onClockTick,
    onReset,
    onSkip,
    onTimerToggle,
    onToggleTheme,
    onUpdateSettings,
    progress,
    state,
    stats,
    theme,
    todaysSessions,
  } = props;

  return (
    <div
      className="min-h-[calc(100svh-4rem)] bg-base-100 text-base-content transition-colors"
      style={theme === "dark" ? darkThemeStyle : undefined}
    >
      <div className="flex min-h-[calc(100svh-4rem)] w-full flex-col px-4 py-5 sm:px-6 lg:px-8">
        <TimerHeader
          settings={state.settings}
          theme={theme}
          onApplyPreset={onApplyPreset}
          onToggleTheme={onToggleTheme}
          onUpdateSettings={onUpdateSettings}
        />

        <main className="flex flex-1 items-center justify-center py-6">
          <section aria-label="Pomodoro timer" className="w-full">
            <div className="mx-auto mb-4 flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <StateBadge label="Current" phase={state.phase} />
                <StateBadge label="Next" phase={nextPhase} />
              </div>
              <CycleTrack items={cycleItems} />
            </div>

            <FlipClock
              isRunning={state.isRunning}
              remainingSeconds={state.remainingSeconds}
              targetEndAt={state.targetEndAt}
              theme={theme}
              onComplete={onClockComplete}
              onTick={onClockTick}
            />

            <progress
              aria-label="Timer progress"
              className="progress mx-auto mt-6 block h-1.5 w-full max-w-7xl"
              max={1}
              value={progress}
            />

            <TimerActions
              isRunning={state.isRunning}
              onReset={onReset}
              onSkip={onSkip}
              onTimerToggle={onTimerToggle}
            />
            <SessionHistory sessions={todaysSessions} stats={stats} />
          </section>
        </main>
      </div>
    </div>
  );
}

type TimerHeaderProps = {
  onApplyPreset: (settings: Settings) => void;
  onToggleTheme: () => void;
  onUpdateSettings: (settings: Partial<Settings>) => void;
  settings: Settings;
  theme: Theme;
};

function TimerHeader(props: TimerHeaderProps) {
  const { onApplyPreset, onToggleTheme, onUpdateSettings, settings, theme } =
    props;

  return (
    <header className="mx-auto flex w-full max-w-7xl items-start justify-between gap-5">
      <div>
        <p className="route-kicker">Focus instrument · Local session log</p>
        <h1 className="heading mt-2 text-4xl sm:text-5xl">Pomodoro</h1>
      </div>

      <div className="flex items-center gap-1">
        <div
          className="tooltip tooltip-bottom"
          data-tip={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          <button
            aria-label="Toggle color mode"
            className="btn btn-square btn-ghost"
            onClick={onToggleTheme}
            type="button"
          >
            {theme === "dark" ? (
              <SunIcon aria-hidden="true" className="size-5" />
            ) : (
              <MoonIcon aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
        <SettingsDialog
          settings={settings}
          onApplyPreset={onApplyPreset}
          onUpdateSettings={onUpdateSettings}
        />
      </div>
    </header>
  );
}

type TimerActionsProps = {
  isRunning: boolean;
  onReset: () => void;
  onSkip: () => void;
  onTimerToggle: () => void;
};

function TimerActions(props: TimerActionsProps) {
  const { isRunning, onReset, onSkip, onTimerToggle } = props;
  const primaryActionLabel = isRunning ? "Pause" : "Start";
  const PrimaryActionIcon = isRunning ? PauseIcon : PlayIcon;

  return (
    <div className="mx-auto mt-7 flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:justify-center">
      <button
        className="btn btn-neutral min-w-36"
        onClick={onTimerToggle}
        type="button"
      >
        <PrimaryActionIcon aria-hidden="true" className="size-4" />
        {primaryActionLabel}
      </button>
      <button className="btn" onClick={onReset} type="button">
        <RotateCcwIcon aria-hidden="true" className="size-4" />
        Reset
      </button>
      <button className="btn" onClick={onSkip} type="button">
        <SkipForwardIcon aria-hidden="true" className="size-4" />
        Skip
      </button>
    </div>
  );
}

type FlipClockProps = {
  isRunning: boolean;
  onComplete: () => void;
  onTick: (state: FlipClockCountdownState) => void;
  remainingSeconds: number;
  targetEndAt: number;
  theme: Theme;
};

function FlipClock(props: FlipClockProps) {
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
          borderRadius: 10,
          boxShadow:
            theme === "dark"
              ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 24px 46px -32px rgba(0,0,0,0.9)"
              : "inset 0 1px 0 rgba(255,255,255,0.88), 0 24px 46px -34px rgba(28,25,23,0.45)",
          color: digitColor,
          fontSize: "clamp(5.4rem, 18vw, 18.5rem)",
          height: "clamp(8rem, 27vw, 24rem)",
          width: "clamp(5.15rem, 23vw, 21rem)",
        }}
        dividerStyle={{ color: dividerColor, height: 1 }}
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
        now={isRunning ? Date.now : zeroNow}
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

type StateBadgeProps = {
  label: string;
  phase: Phase;
};

function StateBadge(props: StateBadgeProps) {
  const { label, phase } = props;
  const Icon = phase === "focus" ? TimerResetIcon : CoffeeIcon;

  return (
    <span className="badge badge-outline h-auto gap-2 px-3 py-2 font-mono text-[0.68rem] tracking-[0.12em] uppercase">
      <span className="text-base-content/45">{label}</span>
      <Icon aria-hidden="true" className="size-3.5" />
      {phaseLabels[phase]}
    </span>
  );
}

type CycleTrackProps = {
  items: CycleItem[];
};

function CycleTrack(props: CycleTrackProps) {
  const { items } = props;

  return (
    <ol aria-label="Current Pomodoro cycle" className="flex items-center gap-2">
      {items.map((item) => (
        <li
          className="tooltip tooltip-bottom"
          data-tip={`${phaseLabels[item.phase]} · ${item.status}`}
          key={item.index}
        >
          <span
            aria-hidden="true"
            className={`status status-sm ${getCycleStatusClass({ item })}`}
          />
          <span className="sr-only">
            {phaseLabels[item.phase]} {item.status}
          </span>
        </li>
      ))}
    </ol>
  );
}

type GetCycleStatusClassOptions = {
  item: CycleItem;
};

function getCycleStatusClass(opts: GetCycleStatusClassOptions) {
  const { item } = opts;
  const colorClass =
    item.phase === "focus" ? "status-success" : "status-warning";
  let opacityClass = "opacity-30";

  if (item.status === "current") {
    opacityClass =
      "scale-125 opacity-100 ring-2 ring-base-content ring-offset-2 ring-offset-base-100";
  } else if (item.status === "done") {
    opacityClass = "opacity-90";
  }

  return `${colorClass} ${opacityClass}`;
}

function createInitialTimerState(): TimerState {
  const settings = readStoredSettings() ?? defaultSettings;

  return {
    completedSegments: 0,
    isRunning: false,
    lastCompletedPhase: null,
    phase: "focus",
    remainingSeconds: getPhaseSeconds({ phase: "focus", settings }),
    sessionLog: readStoredSessionLog(),
    settings,
    targetEndAt: 0,
  };
}

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case "update-settings": {
      const settings = normalizeSettings({
        settings: { ...state.settings, ...action.partial },
      });

      return {
        ...state,
        isRunning: false,
        lastCompletedPhase: null,
        remainingSeconds: getPhaseSeconds({ phase: state.phase, settings }),
        settings,
        targetEndAt: 0,
      };
    }
    case "apply-preset": {
      const settings = normalizeSettings({ settings: action.settings });

      return {
        ...state,
        completedSegments: 0,
        isRunning: false,
        lastCompletedPhase: null,
        phase: "focus",
        remainingSeconds: getPhaseSeconds({ phase: "focus", settings }),
        settings,
        targetEndAt: 0,
      };
    }
    case "advance": {
      return advanceTimerState({ now: action.now, state });
    }
    case "complete": {
      const plannedSeconds = getPhaseSeconds({
        phase: state.phase,
        settings: state.settings,
      });
      const completedSession: CompletedSession = {
        completedAt: new Date(action.completedAt).toISOString(),
        completedSeconds: plannedSeconds,
        id: `${action.completedAt}-${state.phase}-${state.sessionLog.length}`,
        phase: state.phase,
        plannedSeconds,
        settingsSnapshot: state.settings,
        startedAt: new Date(action.startedAt).toISOString(),
      };
      const advancedState = advanceTimerState({
        now: action.completedAt,
        state,
      });

      return {
        ...advancedState,
        lastCompletedPhase: state.phase,
        sessionLog: [...state.sessionLog, completedSession],
      };
    }
    case "reset": {
      return {
        ...state,
        isRunning: false,
        lastCompletedPhase: null,
        remainingSeconds: getPhaseSeconds({
          phase: state.phase,
          settings: state.settings,
        }),
        targetEndAt: 0,
      };
    }
    case "toggle": {
      if (state.isRunning) {
        const remainingSeconds =
          state.targetEndAt > 0
            ? Math.max(0, Math.ceil((state.targetEndAt - action.now) / 1000))
            : state.remainingSeconds;

        return {
          ...state,
          isRunning: false,
          lastCompletedPhase: null,
          remainingSeconds,
          targetEndAt: 0,
        };
      }

      if (state.remainingSeconds <= 0) {
        return { ...state, lastCompletedPhase: null };
      }

      return {
        ...state,
        isRunning: true,
        lastCompletedPhase: null,
        targetEndAt: action.now + state.remainingSeconds * 1000,
      };
    }
    case "tick": {
      return { ...state, remainingSeconds: action.remainingSeconds };
    }
    default: {
      return state;
    }
  }
}

type AdvanceTimerStateOptions = {
  now: number;
  state: TimerState;
};

function advanceTimerState(opts: AdvanceTimerStateOptions): TimerState {
  const { now, state } = opts;
  const completedSegments =
    state.phase === "focus"
      ? state.completedSegments + 1
      : state.completedSegments;
  const phase = getNextPhase({
    completedFocusCount: completedSegments,
    phase: state.phase,
    segmentsBeforeLongBreak: state.settings.segmentsBeforeLongBreak,
  });
  const remainingSeconds = getPhaseSeconds({
    phase,
    settings: state.settings,
  });

  return {
    ...state,
    completedSegments,
    isRunning: state.settings.autoStartNext,
    phase,
    remainingSeconds,
    targetEndAt: state.settings.autoStartNext
      ? now + remainingSeconds * 1000
      : 0,
  };
}

type GetDocumentTitleOptions = {
  state: TimerState;
};

function getDocumentTitle(opts: GetDocumentTitleOptions) {
  const { state } = opts;

  if (state.lastCompletedPhase && !state.isRunning) {
    return `${phaseLabels[state.lastCompletedPhase]} done - Pomodoro`;
  }

  if (state.isRunning) {
    return `${formatClock({ seconds: state.remainingSeconds })} - ${phaseLabels[state.phase]}`;
  }

  return pageTitle;
}

function TimerLoading() {
  return (
    <output
      aria-label="Loading Pomodoro timer"
      className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-base-100"
    >
      <span className="loading loading-dots loading-lg text-base-content/35" />
    </output>
  );
}

function subscribeToNothing() {
  return () => {
    // Client detection does not subscribe to an external store.
  };
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function getInitialTheme(): Theme {
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function zeroNow() {
  return 0;
}
