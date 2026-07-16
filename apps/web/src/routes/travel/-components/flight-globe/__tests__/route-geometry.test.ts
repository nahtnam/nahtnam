import { describe, expect, it } from "vitest";

import { createRouteSegments } from "../route-geometry";
import type { Coordinate } from "../route-geometry";

describe(createRouteSegments, () => {
  it("creates one direct segment for ordinary routes", () => {
    const from: Coordinate = [-122.38, 37.62];
    const to: Coordinate = [-0.45, 51.47];

    expect(createRouteSegments({ from, to })).toStrictEqual([[from, to]]);
  });

  it("splits westbound date-line routes without a longitude jump", () => {
    const from: Coordinate = [-122.38, 37.62];
    const to: Coordinate = [139.78, 35.55];
    const segments = createRouteSegments({ from, to });

    expect(segments).toHaveLength(2);
    expect(segments[0]?.at(-1)?.[0]).toBe(-180);
    expect(segments[1]?.at(0)?.[0]).toBe(180);
    expectEverySegmentToStayWithinOneWorld(segments);
  });

  it("splits eastbound date-line routes without a longitude jump", () => {
    const from: Coordinate = [139.78, 35.55];
    const to: Coordinate = [-122.38, 37.62];
    const segments = createRouteSegments({ from, to });

    expect(segments).toHaveLength(2);
    expect(segments[0]?.at(-1)?.[0]).toBe(180);
    expect(segments[1]?.at(0)?.[0]).toBe(-180);
    expectEverySegmentToStayWithinOneWorld(segments);
  });
});

function expectEverySegmentToStayWithinOneWorld(segments: Coordinate[][]) {
  for (const segment of segments) {
    expect(segment).toHaveLength(2);
    const [from, to] = segment as [Coordinate, Coordinate];

    expect(Math.abs(to[0] - from[0])).toBeLessThanOrEqual(180);
  }
}
