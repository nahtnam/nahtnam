import { useEffect, useState } from "react";

import type { AiItem, AiResponse } from "../-lib";
import {
  actionError,
  formatTime,
  safeEvidenceUrl,
  snoozeDate,
  textReplyHref,
} from "../-lib";

type ActionCardProps = {
  item: AiItem;
  onRespond: (response: AiResponse) => Promise<void>;
  receipt?: {
    changed: boolean;
    expired: boolean;
    expiresAt?: number;
    id: NonNullable<AiResponse["receiptId"]>;
    version: number;
  };
};

export function ActionCard(props: ActionCardProps) {
  const { item, onRespond, receipt } = props;
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [customDate, setCustomDate] = useState("");
  const active = item.status === "open" || item.status === "snoozed";
  const now = useExpirationClock(
    Math.min(item.usefulUntil, receipt?.expiresAt ?? Infinity)
  );
  const expired = item.usefulUntil <= now;
  const staleReceipt = isReceiptStale(receipt, now);
  const canRespond = active && !expired && !staleReceipt;
  const evidenceUrl = safeEvidenceUrl(item.sourceUrl);

  async function respond(action: AiResponse["action"], snoozeUntil?: number) {
    if (!canRespond || busy) {
      return;
    }
    if (action === "snooze" && (!snoozeUntil || snoozeUntil <= Date.now())) {
      setSaveError("Choose a time in the future.");
      return;
    }
    setBusy(true);
    setSaveError(undefined);
    try {
      await onRespond({
        action,
        code: item.code,
        expectedVersion: receipt?.version ?? item.version,
        ...(receipt ? { receiptId: receipt.id } : {}),
        ...(snoozeUntil ? { snoozeUntil } : {}),
      });
    } catch (error) {
      setSaveError(actionError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card card-border bg-base-100" aria-label={item.title}>
      <div className="card-body gap-4 p-5 sm:p-6">
        <CardHeading expired={expired} item={item} />

        {staleReceipt && (
          <output className="block rounded-box bg-warning/10 p-3 text-sm">
            {receipt?.changed
              ? "This item changed after the receipt was made. Review its current details before deciding."
              : "This receipt has expired. Open the current item before making a change."}
            <a
              className="link mt-2 block font-medium"
              href={`/ai/item/${encodeURIComponent(item.code)}`}
            >
              Review current item
            </a>
          </output>
        )}

        {canRespond && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {item.kind === "question" && item.question ? (
                <>
                  <button
                    className="btn btn-primary min-h-11 flex-1"
                    disabled={busy}
                    type="button"
                    onClick={() => respond("yes")}
                  >
                    {item.question.yesLabel}
                  </button>
                  <button
                    className="btn btn-outline min-h-11 flex-1"
                    disabled={busy}
                    type="button"
                    onClick={() => respond("no")}
                  >
                    {item.question.noLabel}
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary min-h-11"
                  disabled={busy}
                  type="button"
                  onClick={() => respond("done")}
                >
                  Done
                </button>
              )}
              <button
                className="btn btn-ghost min-h-11"
                disabled={busy}
                type="button"
                onClick={() => respond("ignore")}
              >
                Ignore
              </button>
              <button
                className="btn btn-ghost min-h-11"
                disabled={busy}
                type="button"
                onClick={() => respond("not_mine")}
              >
                Not mine
              </button>
            </div>
            {item.kind === "question" && (
              <p className="text-xs text-base-content/55">
                Records your answer. Any separate action still needs to be
                completed.
              </p>
            )}
            <details className="rounded-box border border-base-300 px-3 py-2">
              <summary className="cursor-pointer py-1 text-sm font-medium">
                Snooze
              </summary>
              <p className="mt-2 text-xs text-base-content/55">
                These choices use this device&apos;s local time.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="btn btn-sm"
                  disabled={busy}
                  type="button"
                  onClick={() => respond("snooze", snoozeDate(1))}
                >
                  Tomorrow
                </button>
                <button
                  className="btn btn-sm"
                  disabled={busy}
                  type="button"
                  onClick={() => respond("snooze", snoozeDate(7))}
                >
                  One week
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-2 pb-1">
                <label
                  className="flex min-w-0 flex-1 flex-col gap-1 text-xs"
                  htmlFor={`snooze-${item.code}`}
                >
                  Custom time
                  <input
                    className="input w-full"
                    id={`snooze-${item.code}`}
                    type="datetime-local"
                    value={customDate}
                    onChange={(event) =>
                      setCustomDate(event.currentTarget.value)
                    }
                  />
                </label>
                <button
                  className="btn"
                  disabled={busy || !customDate}
                  type="button"
                  onClick={() =>
                    respond("snooze", new Date(customDate).getTime())
                  }
                >
                  Snooze until then
                </button>
              </div>
            </details>
            {item.kind !== "info" && (
              <details className="px-1 text-sm">
                <summary className="cursor-pointer py-1 text-base-content/65">
                  Reply by text
                </summary>
                <div className="mt-2 flex flex-wrap gap-3">
                  {(item.kind === "question" ? ["Y", "N"] : ["DONE"]).map(
                    (command) => (
                      <a
                        key={command}
                        className="link font-mono"
                        href={textReplyHref(`${command} ${item.code}`)}
                      >
                        {command} {item.code}
                      </a>
                    )
                  )}
                </div>
                <p className="mt-2 text-xs text-base-content/55">
                  Use your configured personal number. If the message opens
                  blank, type the code above and press Send.
                </p>
              </details>
            )}
          </div>
        )}

        {saveError && (
          <p className="text-sm text-error" role="alert">
            {saveError}
          </p>
        )}
        <details className="border-t border-base-300 pt-3 text-sm">
          <summary className="cursor-pointer text-base-content/60">
            Source and details
          </summary>
          <dl className="mt-3 grid gap-2 text-xs text-base-content/65">
            <div>
              <dt className="inline font-medium">Source: </dt>
              <dd className="inline">{item.source}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Evidence: </dt>
              <dd className="inline">{formatTime(item.evidenceAt)}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Last checked: </dt>
              <dd className="inline">{formatTime(item.checkedAt)}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Useful until: </dt>
              <dd className="inline">{formatTime(item.usefulUntil)}</dd>
            </div>
          </dl>
          {evidenceUrl && (
            <a
              className="link mt-3 inline-block"
              href={evidenceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open original source
            </a>
          )}
          <a
            className="link mt-3 ml-4 inline-block"
            href={`/ai/item/${encodeURIComponent(item.code)}`}
          >
            Item history
          </a>
        </details>
      </div>
    </article>
  );
}

function CardHeading(props: { item: AiItem; expired: boolean }) {
  const { item, expired } = props;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-mono text-base-content/55">{item.code}</span>
        <div className="flex flex-wrap gap-2">
          {item.priority === "urgent" && (
            <span className="badge badge-error badge-soft badge-sm">
              Time sensitive
            </span>
          )}
          {item.ownership === "unknown" && (
            <span className="badge badge-warning badge-soft badge-sm">
              Needs your review
            </span>
          )}
          <span className="badge badge-ghost badge-sm">
            {expired ? "Expired" : item.status}
          </span>
        </div>
      </div>
      <div>
        <h2 className="card-title text-xl leading-snug">{item.title}</h2>
        <p className="mt-2 whitespace-pre-wrap text-base-content/75">
          {item.whyNow}
        </p>
        {item.dueAt && (
          <p className="mt-3 text-sm font-medium">
            Due {formatTime(item.dueAt)}
          </p>
        )}
        {item.status === "snoozed" && item.snoozedUntil && (
          <p className="mt-2 text-sm">Back {formatTime(item.snoozedUntil)}</p>
        )}
      </div>
    </>
  );
}

function useExpirationClock(expiresAt: number) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (expiresAt <= now) {
      return;
    }
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.min(expiresAt - now + 1, 2_147_483_647)
    );
    return () => clearTimeout(timer);
  }, [expiresAt, now]);
  return now;
}

function isReceiptStale(receipt: ActionCardProps["receipt"], now: number) {
  if (!receipt) {
    return false;
  }
  if (receipt.changed || receipt.expired) {
    return true;
  }
  return receipt.expiresAt !== undefined && receipt.expiresAt <= now;
}
