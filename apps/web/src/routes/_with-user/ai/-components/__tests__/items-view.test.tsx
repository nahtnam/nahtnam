import type { Id } from "@repo/backend/data-model";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { QueryFunction } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";

import type { AiItem } from "../../-lib";
import { currentMinute, useMinuteClock } from "../../-use-minute-clock";
import { ItemsView } from "../items-view";

vi.mock(import("../action-feedback"), () => ({
  useAiActions: () => ({
    respond: vi.fn<() => Promise<void>>(),
    undo: vi.fn<() => Promise<void>>(),
  }),
}));

function ClockedItems(props: {
  initialNow: number;
  view: "snoozed" | "today";
}) {
  const { initialNow, view } = props;
  const now = useMinuteClock(initialNow);
  return <ItemsView now={now} view={view} />;
}

function ClockValue(props: { initialNow: number }) {
  const { initialNow } = props;
  const now = useMinuteClock(initialNow);
  return <output>{now}</output>;
}

describe("time-dependent action views", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("hydrates with the loader time before adopting the browser clock", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-07T16:00:00Z"));
    const initialNow = currentMinute();
    const container = new DOMParser().parseFromString(
      renderToString(<ClockValue initialNow={initialNow} />),
      "text/html"
    ).body;
    vi.setSystemTime(initialNow + 60_000);
    const onRecoverableError = vi.fn<(error: unknown) => void>();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <ClockValue initialNow={initialNow} />, {
        onRecoverableError,
      });
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toBe(String(initialNow + 60_000));
    act(() => root?.unmount());
    expect(vi.getTimerCount()).toBe(0);
  });
  test("refreshes the query when a snooze ends while Today remains open", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-07T16:00:00Z"));
    const now = currentMinute();
    const dueItem: AiItem = {
      _creationTime: now,
      _id: "item-test" as Id<"aiItems">,
      appearances: 0,
      checkedAt: now,
      code: "A7",
      evidenceAt: now,
      kind: "task",
      nextNotifyAt: now + 60_000,
      ownerTokenIdentifier: "test-owner",
      ownership: "confirmed",
      priority: "routine",
      snoozedUntil: now + 60_000,
      source: "test",
      sourceKey: "test-item",
      status: "snoozed",
      title: "Review the appointment",
      usefulUntil: now + 86_400_000,
      version: 1,
      whyNow: "The snooze has ended.",
    };
    const query = vi
      .fn<QueryFunction<AiItem[]>>()
      .mockResolvedValueOnce([])
      .mockResolvedValue([dueItem]);
    const client = new QueryClient({
      defaultOptions: { queries: { queryFn: query, retry: false } },
    });
    const rendered = render(
      <QueryClientProvider client={client}>
        <ClockedItems initialNow={now} view="today" />
      </QueryClientProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByText("You're clear for now")).toBeVisible();
    expect(query.mock.calls[0]?.[0].queryKey[2]).toStrictEqual({
      limit: 100,
      now,
      view: "today",
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(
      screen.getByRole("article", { name: "Review the appointment" })
    ).toBeVisible();
    expect(query.mock.calls[1]?.[0].queryKey[2]).toStrictEqual({
      limit: 100,
      now: now + 60_000,
      view: "today",
    });

    rendered.unmount();
    client.clear();
    expect(vi.getTimerCount()).toBe(0);
  });

  test("refreshes immediately when returning to a suspended page", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-07T16:00:00Z"));
    const initialNow = currentMinute();
    const query = vi.fn<QueryFunction<AiItem[]>>().mockResolvedValue([]);
    const client = new QueryClient({
      defaultOptions: { queries: { queryFn: query, retry: false } },
    });
    const rendered = render(
      <QueryClientProvider client={client}>
        <ClockedItems initialNow={initialNow} view="snoozed" />
      </QueryClientProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    vi.setSystemTime(initialNow + 3_600_000);
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(query.mock.calls.at(-1)?.[0].queryKey[2]).toStrictEqual({
      limit: 100,
      now: initialNow + 3_600_000,
      view: "snoozed",
    });
    rendered.unmount();
    client.clear();
    expect(vi.getTimerCount()).toBe(0);
  });
});
