import { describe, expect, test } from "vitest";

import {
  differenceInUtcMonths,
  formatUtcMonthYear,
  getUtcYear,
} from "../resume-date";

describe("resume date formatting", () => {
  test("keeps UTC date-only timestamps in their stored month and year", () => {
    const january = Date.UTC(2026, 0, 1);

    expect(formatUtcMonthYear(january)).toBe("Jan 2026");
    expect(getUtcYear(january)).toBe(2026);
  });

  test("calculates month differences using UTC date parts", () => {
    expect(
      differenceInUtcMonths({
        end: new Date(Date.UTC(2022, 9, 1)),
        start: new Date(Date.UTC(2021, 10, 1)),
      })
    ).toBe(11);
  });
});
