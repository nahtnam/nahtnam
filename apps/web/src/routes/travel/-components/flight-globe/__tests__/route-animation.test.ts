import { describe, expect, it } from "vitest";

import type { ArcData } from "../../types";
import {
  getRouteAnimationState,
  getRouteDelayMs,
  getRouteDurationMs,
} from "../route-animation";

const baseArc: ArcData = {
  count: 1,
  endCode: "LHR",
  endLat: 51.47,
  endLng: -0.45,
  firstFlightDate: "2021-01-01",
  flightTimeHours: 4,
  startCode: "SFO",
  startLat: 37.62,
  startLng: -122.38,
  tripType: "one-way",
  year: 2021,
};

describe(getRouteDelayMs, () => {
  it("stagger starts by 500ms for every year after 2021", () => {
    expect(getRouteDelayMs({ year: 2021 })).toBe(0);
    expect(getRouteDelayMs({ year: 2022 })).toBe(500);
    expect(getRouteDelayMs({ year: 2023 })).toBe(1000);
  });
});

describe(getRouteDurationMs, () => {
  it("keeps route duration proportional to flight distance", () => {
    const shortDuration = getRouteDurationMs({ flightTimeHours: 2 });
    const longDuration = getRouteDurationMs({ flightTimeHours: 6 });

    expect(longDuration).toBe(shortDuration * 3);
  });
});

describe(getRouteAnimationState, () => {
  it("waits for the route's year delay", () => {
    const arc = { ...baseArc, year: 2023 };

    expect(getRouteAnimationState({ arc, elapsedMs: 999 })).toBeNull();
    expect(getRouteAnimationState({ arc, elapsedMs: 1000 })).toStrictEqual({
      direction: "forward",
      progress: 0,
    });
  });

  it("restarts a one-way route from its origin", () => {
    const durationMs = getRouteDurationMs({
      flightTimeHours: baseArc.flightTimeHours,
    });

    expect(
      getRouteAnimationState({ arc: baseArc, elapsedMs: durationMs * 1.25 })
    ).toStrictEqual({ direction: "forward", progress: 0.25 });
  });

  it("reverses a round-trip route after reaching its destination", () => {
    const arc = { ...baseArc, tripType: "round-trip" as const };
    const durationMs = getRouteDurationMs({
      flightTimeHours: arc.flightTimeHours,
    });

    expect(
      getRouteAnimationState({ arc, elapsedMs: durationMs * 1.25 })
    ).toStrictEqual({ direction: "reverse", progress: 0.25 });
  });
});
