import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

export function currentMinute() {
  return Math.floor(Date.now() / MINUTE) * MINUTE;
}

function subscribeClock(onChange: () => void) {
  const timer = window.setInterval(onChange, MINUTE);
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

export function useMinuteClock(initialNow: number) {
  return useSyncExternalStore(subscribeClock, currentMinute, () => initialNow);
}
