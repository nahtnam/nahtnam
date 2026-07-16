export type Phase = "focus" | "longBreak" | "shortBreak";
export type Theme = "dark" | "light";

export type Settings = {
  autoStartNext: boolean;
  focusMinutes: number;
  longBreakMinutes: number;
  segmentsBeforeLongBreak: number;
  shortBreakMinutes: number;
  soundEnabled: boolean;
};

export type CompletedSession = {
  completedAt: string;
  completedSeconds: number;
  id: string;
  phase: Phase;
  plannedSeconds: number;
  settingsSnapshot: Settings;
  startedAt: string;
};

export type CycleItem = {
  index: number;
  phase: Phase;
  status: "current" | "done" | "up next";
};

export type SessionStats = {
  breakCount: number;
  focusCount: number;
  focusSeconds: number;
  totalSeconds: number;
};

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export const defaultSettings: Settings = {
  autoStartNext: false,
  focusMinutes: 25,
  longBreakMinutes: 15,
  segmentsBeforeLongBreak: 4,
  shortBreakMinutes: 5,
  soundEnabled: true,
};

export const presets = [
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
] satisfies { label: string; settings: Settings }[];

export const phaseLabels: Record<Phase, string> = {
  focus: "Focus",
  longBreak: "Long break",
  shortBreak: "Short break",
};

export const historyStorageKey = "pomodoro.completedSessions.v1";
export const settingsStorageKey = "pomodoro.settings.v1";
const sessionDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

type GetPhaseSecondsOptions = {
  phase: Phase;
  settings: Settings;
};

export function getPhaseSeconds(opts: GetPhaseSecondsOptions) {
  const { phase, settings } = opts;

  if (phase === "focus") {
    return settings.focusMinutes * 60;
  }

  if (phase === "longBreak") {
    return settings.longBreakMinutes * 60;
  }

  return settings.shortBreakMinutes * 60;
}

type GetNextPhaseOptions = {
  completedFocusCount: number;
  phase: Phase;
  segmentsBeforeLongBreak: number;
};

export function getNextPhase(opts: GetNextPhaseOptions): Phase {
  const { completedFocusCount, phase, segmentsBeforeLongBreak } = opts;

  if (phase !== "focus") {
    return "focus";
  }

  if (completedFocusCount % segmentsBeforeLongBreak === 0) {
    return "longBreak";
  }

  return "shortBreak";
}

type GetCycleItemsOptions = {
  completedSegments: number;
  currentPhase: Phase;
  segmentsBeforeLongBreak: number;
};

export function getCycleItems(opts: GetCycleItemsOptions): CycleItem[] {
  const { completedSegments, currentPhase, segmentsBeforeLongBreak } = opts;
  const rawFocusInCycle = completedSegments % segmentsBeforeLongBreak;
  const focusInCycle =
    currentPhase !== "focus" && rawFocusInCycle === 0 && completedSegments > 0
      ? segmentsBeforeLongBreak
      : rawFocusInCycle;
  const currentIndex =
    currentPhase === "focus"
      ? focusInCycle * 2
      : Math.max(0, focusInCycle * 2 - 1);

  return Array.from({ length: segmentsBeforeLongBreak * 2 }, (_, index) => ({
    index,
    phase: getCyclePhase({ index, segmentsBeforeLongBreak }),
    status: getCycleStatus({ currentIndex, index }),
  }));
}

type GetCyclePhaseOptions = {
  index: number;
  segmentsBeforeLongBreak: number;
};

function getCyclePhase(opts: GetCyclePhaseOptions): Phase {
  const { index, segmentsBeforeLongBreak } = opts;

  if (index % 2 === 0) {
    return "focus";
  }

  if (index === segmentsBeforeLongBreak * 2 - 1) {
    return "longBreak";
  }

  return "shortBreak";
}

type GetCycleStatusOptions = {
  currentIndex: number;
  index: number;
};

function getCycleStatus(opts: GetCycleStatusOptions): CycleItem["status"] {
  const { currentIndex, index } = opts;

  if (index < currentIndex) {
    return "done";
  }

  if (index === currentIndex) {
    return "current";
  }

  return "up next";
}

type GetSessionStatsOptions = {
  sessions: CompletedSession[];
};

export function getSessionStats(opts: GetSessionStatsOptions): SessionStats {
  const { sessions } = opts;
  const focusCount = sessions.filter(
    (session) => session.phase === "focus"
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

type GetSessionsCompletedOnDateOptions = {
  dateKey: string;
  sessions: CompletedSession[];
};

export function getSessionsCompletedOnDate(
  opts: GetSessionsCompletedOnDateOptions
) {
  const { dateKey, sessions } = opts;

  return sessions.filter((session) => {
    const completedAt = new Date(session.completedAt);

    if (Number.isNaN(completedAt.getTime())) {
      return false;
    }

    return getLocalDateKey({ date: completedAt }) === dateKey;
  });
}

type GetLocalDateKeyOptions = {
  date: Date;
};

export function getLocalDateKey(opts: GetLocalDateKeyOptions) {
  const { date } = opts;
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

export function readStoredSessionLog(): CompletedSession[] {
  if (globalThis.window === undefined) {
    return [];
  }

  const storedValue = globalThis.window.localStorage.getItem(historyStorageKey);

  if (!storedValue) {
    return [];
  }

  const parsedValue = parseStoredJson({ storedValue });

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.filter((value): value is CompletedSession =>
    isCompletedSession(value)
  );
}

export function readStoredSettings(): Settings | undefined {
  if (globalThis.window === undefined) {
    return;
  }

  const storedValue =
    globalThis.window.localStorage.getItem(settingsStorageKey);

  if (!storedValue) {
    return;
  }

  const parsedValue = parseStoredJson({ storedValue });

  if (!isSettings(parsedValue)) {
    return;
  }

  return normalizeSettings({ settings: parsedValue });
}

type ParseStoredJsonOptions = {
  storedValue: string;
};

function parseStoredJson(opts: ParseStoredJsonOptions): unknown {
  const { storedValue } = opts;

  try {
    return JSON.parse(storedValue) as unknown;
  } catch {
    return null;
  }
}

function isCompletedSession(value: unknown): value is CompletedSession {
  if (!isRecord(value) || !isPhase(value.phase)) {
    return false;
  }

  const stringFieldsAreValid =
    typeof value.completedAt === "string" &&
    typeof value.id === "string" &&
    typeof value.startedAt === "string";
  const durationFieldsAreValid =
    typeof value.completedSeconds === "number" &&
    typeof value.plannedSeconds === "number";

  return (
    stringFieldsAreValid &&
    durationFieldsAreValid &&
    isSettings(value.settingsSnapshot)
  );
}

function isSettings(value: unknown): value is Settings {
  if (!isRecord(value)) {
    return false;
  }

  const hasBooleanSettings =
    typeof value.autoStartNext === "boolean" &&
    typeof value.soundEnabled === "boolean";
  const hasDurationSettings =
    typeof value.focusMinutes === "number" &&
    typeof value.longBreakMinutes === "number" &&
    typeof value.segmentsBeforeLongBreak === "number" &&
    typeof value.shortBreakMinutes === "number";

  return hasBooleanSettings && hasDurationSettings;
}

function isPhase(value: unknown): value is Phase {
  return value === "focus" || value === "longBreak" || value === "shortBreak";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type NormalizeSettingsOptions = {
  settings: Settings;
};

export function normalizeSettings(opts: NormalizeSettingsOptions): Settings {
  const { settings } = opts;

  return {
    autoStartNext: settings.autoStartNext,
    focusMinutes: clamp({ max: 120, min: 1, value: settings.focusMinutes }),
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

type ClampOptions = {
  max: number;
  min: number;
  value: number;
};

function clamp(opts: ClampOptions) {
  const { max, min, value } = opts;

  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

type FormatClockOptions = {
  seconds: number;
};

export function formatClock(opts: FormatClockOptions) {
  const { seconds } = opts;
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

type FormatDurationOptions = {
  seconds: number;
};

export function formatDuration(opts: FormatDurationOptions) {
  const { seconds } = opts;

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

type FormatSessionTimeOptions = {
  isoDate: string;
};

export function formatSessionTime(opts: FormatSessionTimeOptions) {
  const { isoDate } = opts;
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return sessionDateFormatter.format(date);
}

export function ringAlarm() {
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
