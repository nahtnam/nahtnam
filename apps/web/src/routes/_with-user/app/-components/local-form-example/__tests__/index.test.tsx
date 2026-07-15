import { DaisyUIProvider } from "@formadapter/daisyui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { LocalFormExample } from "../index";

describe(LocalFormExample, () => {
  test("validates and submits entirely in the browser", async () => {
    const user = userEvent.setup();

    render(
      <DaisyUIProvider>
        <LocalFormExample />
      </DaisyUIProvider>
    );

    const projectNameInput = screen.getByRole("textbox", {
      name: "Project name",
    });
    const submitButton = screen.getByRole("button", {
      name: "Validate form",
    });

    await user.clear(projectNameInput);
    await user.click(submitButton);

    expect(projectNameInput).toHaveAttribute("aria-invalid", "true");
    expect(projectNameInput).toHaveFocus();
    await expect(
      screen.findAllByText("Enter at least 2 characters.")
    ).resolves.toHaveLength(2);

    await user.type(projectNameInput, "Acme");
    await user.click(submitButton);

    await expect(
      screen.findByText("Acme validated locally; nothing was saved.")
    ).resolves.toBeInTheDocument();
  });
});
