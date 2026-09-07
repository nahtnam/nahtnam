import { render, screen } from "@testing-library/react";
import { shouldCaptureElement } from "posthog-js/lib/src/autocapture-utils";
import { describe, expect, test } from "vitest";

import { PrivateAiPage } from "../private-page";

describe(PrivateAiPage, () => {
  test("PostHog excludes action content and nested controls from DOM capture", () => {
    render(
      <PrivateAiPage>
        <article>
          <h1>Private action title</h1>
          <p>Private evidence details</p>
          <label>
            Personal phone
            <input defaultValue="+14155550123" />
          </label>
          <button type="button">Record my answer</button>
        </article>
      </PrivateAiPage>
    );
    for (const element of [
      screen.getByRole("heading"),
      screen.getByText("Private evidence details"),
      screen.getByRole("textbox"),
      screen.getByRole("button"),
    ]) {
      expect(shouldCaptureElement(element)).toBeFalsy();
    }
    // The same class is the installed recorder's subtree-blocking default.
    expect(screen.getByRole("main")).toHaveClass("ph-no-capture");
  });
});
