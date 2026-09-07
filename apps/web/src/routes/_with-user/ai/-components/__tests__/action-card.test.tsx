import type { Id } from "@repo/backend/data-model";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import type { AiItem, AiResponse } from "../../-lib";
import { ActionCard } from "../action-card";

function item(overrides: Partial<AiItem> = {}): AiItem {
  return {
    _creationTime: Date.now(),
    _id: "item-test" as Id<"aiItems">,
    appearances: 1,
    checkedAt: Date.now(),
    code: "A7",
    evidenceAt: Date.now(),
    kind: "task",
    nextNotifyAt: Date.now(),
    ownerTokenIdentifier: "test-owner",
    ownership: "confirmed",
    priority: "routine",
    source: "test-source",
    sourceKey: "test-item",
    status: "open",
    title: "Review the appointment",
    usefulUntil: Date.now() + 86_400_000,
    version: 3,
    whyNow: "The appointment details changed.",
    ...overrides,
  };
}

const receipt = {
  changed: false,
  expired: false,
  id: "receipt-test" as Id<"aiReceipts">,
  version: 3,
};

describe("action receipt decisions", () => {
  test("opening a receipt does nothing; an explicit answer carries its snapshot version", async () => {
    const user = userEvent.setup();
    const respond = vi
      .fn<(response: AiResponse) => Promise<void>>()
      .mockResolvedValue();
    render(
      <ActionCard
        item={item({
          kind: "question",
          question: {
            noLabel: "No, keep this open",
            noOutcome: "dismissed",
            yesLabel: "Yes, already handled",
            yesOutcome: "done",
          },
        })}
        receipt={receipt}
        onRespond={respond}
      />
    );
    expect(respond).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: "Done" })
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Yes, already handled" })
    );
    expect(respond).toHaveBeenCalledWith({
      action: "yes",
      code: "A7",
      expectedVersion: 3,
      receiptId: receipt.id,
    });
  });

  test.each([
    { ...receipt, changed: true },
    { ...receipt, expired: true },
  ])("a changed or expired receipt cannot submit actions", (oldReceipt) => {
    const respond = vi
      .fn<(response: AiResponse) => Promise<void>>()
      .mockResolvedValue();
    render(
      <ActionCard item={item()} receipt={oldReceipt} onRespond={respond} />
    );
    expect(
      screen.queryByRole("button", { name: "Done" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Reply by text")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Review current item" })
    ).toHaveAttribute("href", "/ai/item/A7");
    expect(respond).not.toHaveBeenCalled();
  });

  test("expired evidence and closed items do not offer new decisions", () => {
    const respond = vi
      .fn<(response: AiResponse) => Promise<void>>()
      .mockResolvedValue();
    const { rerender } = render(
      <ActionCard
        item={item({ usefulUntil: Date.now() - 1000 })}
        onRespond={respond}
      />
    );
    expect(
      screen.queryByRole("button", { name: "Done" })
    ).not.toBeInTheDocument();
    rerender(
      <ActionCard item={item({ status: "done" })} onRespond={respond} />
    );
    expect(
      screen.queryByRole("button", { name: "Done" })
    ).not.toBeInTheDocument();
  });

  test("blocks duplicate clicks while a decision is saving", async () => {
    const user = userEvent.setup();
    let finish: (() => void) | undefined;
    // oxlint-disable-next-line promise/avoid-new -- Hold the mutation open to verify duplicate-click prevention.
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const respond = vi
      .fn<(response: AiResponse) => Promise<void>>()
      .mockReturnValue(pending);
    render(<ActionCard item={item()} onRespond={respond} />);
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByRole("button", { name: "Done" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(respond).toHaveBeenCalledOnce();
    finish?.();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Done" })).toBeEnabled()
    );
  });

  test("rejects a custom snooze in the past without submitting", async () => {
    const user = userEvent.setup();
    const respond = vi
      .fn<(response: AiResponse) => Promise<void>>()
      .mockResolvedValue();
    render(<ActionCard item={item()} onRespond={respond} />);
    await user.click(screen.getByText("Snooze", { exact: true }));
    fireEvent.change(screen.getByLabelText("Custom time"), {
      target: { value: "2020-01-01T09:00" },
    });
    await user.click(screen.getByRole("button", { name: "Snooze until then" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose a time in the future."
    );
    expect(respond).not.toHaveBeenCalled();
  });

  test("a rejected version shows a recoverable error", async () => {
    const user = userEvent.setup();
    const respond = vi
      .fn<(response: AiResponse) => Promise<void>>()
      .mockRejectedValue(new Error("This item changed. Refresh its details."));
    render(<ActionCard item={item()} onRespond={respond} />);
    await user.click(screen.getByRole("button", { name: "Done" }));
    await expect(screen.findByRole("alert")).resolves.toHaveTextContent(
      "This item changed."
    );
    expect(screen.getByRole("button", { name: "Done" })).toBeEnabled();
  });

  test("does not render executable source URLs from an automation", () => {
    render(
      <ActionCard
        item={item({ sourceUrl: ["javascript", "alert(1)"].join(":") })}
        onRespond={vi
          .fn<(response: AiResponse) => Promise<void>>()
          .mockResolvedValue()}
      />
    );
    expect(
      screen.queryByRole("link", { name: "Open original source" })
    ).not.toBeInTheDocument();
  });
});
