import { DaisyUIProvider } from "@formadapter/daisyui";
import type { api } from "@repo/backend/api";
import type { Id } from "@repo/backend/data-model";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FunctionArgs, FunctionReturnType } from "convex/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { FeedbackComposer } from "../feedback-composer";

const submitFeedback = vi.hoisted(() =>
  vi.fn<
    (
      args: FunctionArgs<typeof api.ai.submitFeedback>
    ) => Promise<FunctionReturnType<typeof api.ai.submitFeedback>>
  >()
);
// oxlint-disable-next-line vitest/prefer-import-in-mock -- The hook stub omits Convex's unused optimistic-update API.
vi.mock("convex/react", () => ({ useMutation: () => submitFeedback }));

describe("freeform replies", () => {
  beforeEach(() => {
    submitFeedback.mockReset().mockResolvedValue({
      duplicate: false,
      replyId: "reply-test" as Id<"aiReplies">,
    });
  });
  test("saves exact text with its item and receipt context", async () => {
    const user = userEvent.setup();
    render(
      <DaisyUIProvider>
        <FeedbackComposer
          code="A7"
          expectedVersion={3}
          receiptId={"receipt-test" as Id<"aiReceipts">}
        />
      </DaisyUIProvider>
    );
    const body = "  I already handled this.\nPlease stop reminding me.  ";
    fireEvent.change(screen.getByRole("textbox", { name: "Your reply" }), {
      target: { value: body },
    });
    await user.click(screen.getByRole("button", { name: "Save reply" }));
    await expect(
      screen.findByText("Saved for the next automation run.")
    ).resolves.toBeVisible();
    expect(submitFeedback).toHaveBeenCalledWith({
      body,
      code: "A7",
      expectedVersion: 3,
      idempotencyKey: expect.any(String),
      receiptId: "receipt-test",
    });
    expect(screen.getByRole("textbox", { name: "Your reply" })).toHaveValue("");
  });

  test("freezes the observed version while typing and retrying an uncertain submission", async () => {
    const user = userEvent.setup();
    submitFeedback.mockRejectedValueOnce(new Error("Connection interrupted."));
    const { rerender } = render(
      <DaisyUIProvider>
        <FeedbackComposer code="A7" expectedVersion={1} />
      </DaisyUIProvider>
    );
    await user.type(
      screen.getByRole("textbox", { name: "Your reply" }),
      "Later"
    );
    rerender(
      <DaisyUIProvider>
        <FeedbackComposer code="A7" expectedVersion={2} />
      </DaisyUIProvider>
    );
    await user.type(
      screen.getByRole("textbox", { name: "Your reply" }),
      " please"
    );
    await user.click(screen.getByRole("button", { name: "Save reply" }));
    await expect(
      screen.findByText("Connection interrupted.")
    ).resolves.toBeVisible();
    expect(screen.getByRole("textbox", { name: "Your reply" })).toHaveValue(
      "Later please"
    );
    expect(submitFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        body: "Later please",
        code: "A7",
        expectedVersion: 1,
        idempotencyKey: expect.any(String),
      })
    );
    rerender(
      <DaisyUIProvider>
        <FeedbackComposer code="A7" expectedVersion={3} />
      </DaisyUIProvider>
    );
    await user.click(screen.getByRole("button", { name: "Save reply" }));
    await waitFor(() => expect(submitFeedback).toHaveBeenCalledTimes(2));
    expect(submitFeedback.mock.calls[1]).toStrictEqual(
      submitFeedback.mock.calls[0]
    );
    await user.type(
      screen.getByRole("textbox", { name: "Your reply" }),
      "New reply"
    );
    await user.click(screen.getByRole("button", { name: "Save reply" }));
    expect(submitFeedback.mock.calls[2]?.[0].expectedVersion).toBe(3);
  });

  test("starts with fresh context when the user clears an unfinished draft", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <DaisyUIProvider>
        <FeedbackComposer code="A7" expectedVersion={1} />
      </DaisyUIProvider>
    );
    await user.type(
      screen.getByRole("textbox", { name: "Your reply" }),
      "Old draft"
    );
    rerender(
      <DaisyUIProvider>
        <FeedbackComposer code="A7" expectedVersion={2} />
      </DaisyUIProvider>
    );
    await user.clear(screen.getByRole("textbox", { name: "Your reply" }));
    await user.type(
      screen.getByRole("textbox", { name: "Your reply" }),
      "New draft"
    );
    await user.click(screen.getByRole("button", { name: "Save reply" }));
    expect(submitFeedback.mock.calls[0]?.[0].expectedVersion).toBe(2);
  });

  test.each(["   ", "x".repeat(4001)])(
    "does not submit empty or oversized replies",
    async (body) => {
      const user = userEvent.setup();
      render(
        <DaisyUIProvider>
          <FeedbackComposer />
        </DaisyUIProvider>
      );
      fireEvent.change(screen.getByRole("textbox", { name: "Your reply" }), {
        target: { value: body },
      });
      await user.click(screen.getByRole("button", { name: "Save reply" }));
      expect(submitFeedback).not.toHaveBeenCalled();
    }
  );
});
