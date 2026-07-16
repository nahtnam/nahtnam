import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { AnimatedIdentity, AnimatedIdentityProvider } from "../index";

vi.mock(import("slot-text"), () => ({
  slotText(element: HTMLElement, identity: string) {
    let currentIdentity = identity;
    element.textContent = identity;

    return {
      destroy() {
        // The mock has no resources to release.
      },
      element,
      flash(nextIdentity: string) {
        currentIdentity = nextIdentity;
        element.textContent = nextIdentity;
      },
      set(nextIdentity: string) {
        currentIdentity = nextIdentity;
        element.textContent = nextIdentity;
      },
      get value() {
        return currentIdentity;
      },
    };
  },
}));

describe(AnimatedIdentityProvider, () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("keeps chrome and hero identities in opposite phases", () => {
    vi.useFakeTimers();
    const addEventListener = vi.fn<() => void>();
    const removeEventListener = vi.fn<() => void>();
    const matchMedia = vi.fn<(query: string) => MediaQueryList>(
      () =>
        ({
          addEventListener,
          matches: false,
          removeEventListener,
        }) as unknown as MediaQueryList
    );

    vi.stubGlobal("matchMedia", matchMedia);

    render(
      <AnimatedIdentityProvider>
        <div data-testid="chrome-identity">
          <AnimatedIdentity initialIdentity="@nahtnam" />
        </div>
        <div data-testid="hero-identity">
          <AnimatedIdentity initialIdentity="manthan" />
        </div>
      </AnimatedIdentityProvider>
    );

    expect(screen.getByTestId("chrome-identity")).toHaveTextContent("@nahtnam");
    expect(screen.getByTestId("hero-identity")).toHaveTextContent("manthan");

    act(() => {
      vi.advanceTimersByTime(3400);
    });

    expect(screen.getByTestId("chrome-identity")).toHaveTextContent("manthan");
    expect(screen.getByTestId("hero-identity")).toHaveTextContent("@nahtnam");
  });
});
