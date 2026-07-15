import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { PendingComponent } from "../index";

describe(PendingComponent, () => {
  test("renders an accessible loading status", () => {
    render(<PendingComponent />);

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });
});
