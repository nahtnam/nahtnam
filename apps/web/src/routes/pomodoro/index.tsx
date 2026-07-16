import { createFileRoute } from "@tanstack/react-router";

import { createSeo, pageSeo } from "@/lib/seo";

import { TimerConsole } from "./-components/timer-console";

export const Route = createFileRoute("/pomodoro/")({
  head() {
    const seo = createSeo(pageSeo.pomodoro);

    return {
      ...seo,
      meta: [...seo.meta, { content: "light dark", name: "color-scheme" }],
    };
  },
  component: PomodoroPage,
});

function PomodoroPage() {
  return <TimerConsole />;
}
