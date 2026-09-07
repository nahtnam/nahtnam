# Action center API

The web and Convex deployments share a dedicated `AI_AUTOMATION_SECRET`. The local client reads the same value from `NAHTNAM_AI_TOKEN`. Browser use goes directly through admin-authorized Convex functions; the machine endpoint does not accept cookies as authorization.

The environment takes precedence. When that variable is absent, the client reads only its matching key from the canonical local runtime file `~/.config/nahtnam/automation.env`. This supports scheduled agents that do not inherit an interactive shell's environment. Provision the file privately with mode `600`, owned by the account running the agent; the client rejects symlink components, nonregular files, and other modes/owners. Never store this file in the repository, prompts, memory, or receipts.

Use one `NAME=value` assignment per line, optionally quoting the entire value with matching single or double quotes. Blank/comment lines and unrelated keys (such as `YNAB_ACCESS_TOKEN`) are ignored; the AI client does not load them into its environment or expose them. Shell expansion, interpolation and executable statements are unsupported: do not `source` this file. The requested token must be a nonempty bearer value without whitespace. A missing key, duplicate key, malformed token, unreadable/unsafe file, or explicitly empty environment value fails before any request. The file is limited to 64 KB. Credential errors never include its contents.

`GET https://www.nahtnam.com/api/ai?source=<source>` returns bounded central state with `coverage` and `truncated` indicators. Do not infer that a missing item is new or resolved when the result is truncated; keep the same source key and report the coverage gap. The general snapshot separates active items from recent closed history, so accumulated history cannot silently hide an active deadline. `POST` to the same endpoint accepts one JSON operation. All timestamps are epoch milliseconds. HTTP responses are private and not cached. On an uncertain response, read back state and retry only with the same source keys/idempotency key.

## Process user replies first

Every snapshot also returns `replies` (up to 100 pending replies), `repliesTruncated`, and `nextReplyCursor` (a continuation cursor or null). Replies are owner-wide even when `source` filters the action items. Each includes its database `_id`, original `body`, delivery source (`sms` or `web`), and any available item/receipt context. Read them before source scanning and publication. Collectors handle only clearly attributable replies; the coordinator handles general or cross-source replies. Do not acknowledge an unrelated reply to hide it from a source run.

The authenticated website and the allowlisted SMS sender save arbitrary text verbatim, up to 4,000 characters. SMS says the reply was saved for the next automation run; it does not say a task was completed. A bare `Y`, a correction, and a paragraph all use the same inbox. No SMS command parser changes tracking state. Twilio retries use the same message id and do not create duplicate replies. Website submissions use a stable idempotency key.

After interpreting a reply against current state, apply a tracking change:

```json
{"operation":"reply-decision","replyId":"<reply _id>","code":"A7","expectedVersion":3,"action":"snooze","snoozeUntil":1789459200000}
```

Actions are done/snooze/ignore/not_mine/yes/no. These are structured tracking outcomes chosen by the agent after interpretation, not a grammar the user must follow. Read the current code/version and compare it with the reply's observed item version or receipt snapshot. If they differ, resolve the changed context before acting; do not substitute a newer version to bypass that check. While the reply is pending, the same reply/target/version/action is idempotent. Once acknowledged, it cannot apply further decisions; retry acknowledgment with the same result instead. Read back the item before acknowledging; use the same operation after an uncertain response. A reply can require several actions or none. External work remains governed by its existing permissions and must be verified separately.

Once all requested work is complete and durable results have been read back:

```json
{"operation":"acknowledge-reply","replyId":"<reply _id>","result":"Snoozed A7 until Friday and verified the updated reminder."}
```

`result` is a nonempty summary up to 1,000 characters. Acknowledgment records the outcome and removes the reply from the pending queue; a repeated acknowledgment must preserve the same result. GET never acknowledges. Ambiguous, partially handled or failed work stays pending. Ask one clarification when needed; do not discard the reply. When `nextReplyCursor` is non-null, continue with `GET /api/ai?source=<source>&replyCursor=<URL-encoded cursor>` or `ai-client.py get --source <source> --reply-cursor <cursor>`. Paging does not require acknowledgment. Start fresh without a cursor each run; these are temporary traversal cursors, not durable source state. Never claim complete reply coverage while pages remain.

## Upsert findings

```json
{
  "operation": "upsert",
  "items": [{
    "source": "money-recovery",
    "sourceKey": "merchant:refund-reference",
    "kind": "question",
    "title": "Has this refund arrived?",
    "whyNow": "The promised posting window ends today.",
    "ownership": "confirmed",
    "priority": "routine",
    "evidenceAt": 1788768000000,
    "checkedAt": 1788854400000,
    "nextNotifyAt": 1788854400000,
    "usefulUntil": 1789459200000,
    "question": {
      "yesLabel": "Yes, received",
      "yesOutcome": "done",
      "noLabel": "No, keep tracking",
      "noOutcome": "open"
    }
  }]
}
```

The dates above illustrate encoding only; calculate actual dates at runtime. Maximum 50 items per request. Fields: source ≤80 chars, sourceKey ≤160, title ≤120, whyNow ≤360, optional sourceUrl ≤1500 and HTTP(S), dueAt optional. `kind`: task/question/info. `ownership`: confirmed/unknown. `priority`: routine/urgent. Questions require labels ≤100 chars and outcomes open/done/dismissed. Urgent items require an explicit stable `urgentMilestone` ≤120 chars. Use `resolution: "resolved"` only with actual newer completion evidence. The response supplies code, version and item id. Codes change when the decision's meaning changes; never cache them as source identities.

For unknown ownership, use `kind: "question"`, `questionPurpose: "relevance"`, and an explicit ownership question with `yesOutcome: "open"` and `noOutcome: "dismissed"`. Yes confirms ownership for tracking; No dismisses. This confirmation can appear on paper once. Unknown task assignments and unknown-owner urgent SMS remain ineligible.

## Publish paper

```json
{"operation":"publish","idempotencyKey":"morning:2026-09-08","title":"Today","mode":"brief"}
```

This selects eligible items and queues one receipt with a QR. Morning `mode: "brief"` includes at most three actions/questions plus five informational items from the exact source `calendar-agenda`. Agenda-only receipts are valid; an empty selection stays silent. Upsert actual calendar commitments as ordinary `kind: "info"` items under `calendar-agenda`, with stable occurrence keys, real source evidence, relevant start time in `dueAt`, and an appropriate `usefulUntil`. Put the local time and short commitment name in the title. Checking the calendar again does not create new evidence or justify a repeat. Resolve cancelled occurrences from actual cancellation evidence. Other informational sources cannot fill the morning agenda.

The default `mode: "actions"` selects at most three non-info items. For a narrowly timed reminder use `mode: "timed"`, its source, a stable occurrence key, and `expiresAt`; it selects at most three info items. `source` optionally scopes selection in every mode. All modes use the same ownership, freshness, pause, snooze, dismissal and appearance rules. The server caps the receipt lifetime to its earliest item expiry. Pending receipts reserve their items to avoid duplicates; only worker-reported completion consumes a paper appearance. Obsolete, expired or cancelled queued receipts release that reservation. Inspect returned status; queued is not proof of paper or attention. Do not bypass item selection by posting a second direct-print copy or including a plaintext agenda outside the stored items.

## Record coverage and request urgent SMS

```json
{"operation":"health","source":"inbox-groomer","status":"blocked","checkedAt":1788854400000,"message":"Triage access needs restoring."}
```

Status is ok/partial/blocked; `coverageThrough` is optional. A completed scan with no changes can be ok. A launched process or partial scan cannot establish complete coverage.

```json
{"operation":"notify","code":"A7","expectedVersion":1,"idempotencyKey":"incident:source-key:milestone"}
```

Only the currently actionable urgent item can be sent, and only to the owner-configured phone. Notifications are deduplicated per item/milestone and capped at three per 24 hours. `sent` means provider acceptance; `delivered` is provider delivery reporting. Unknown/reserved results require delivery readback, not a new send key. This is an exception route, not a daily digest.

## Explicit one-off print

The separate print credential is `NAHTNAM_PRINT_TOKEN` in the same protected `~/.config/nahtnam/automation.env` file. Read only that key within the request process, check ownership and mode 600, and never echo or shell-source the file. It is the existing `PRINT_SECRET` for this endpoint; the AI token cannot substitute for it.

`POST /api/print` uses the separately configured print credential. Use `source`, stable `idempotencyKey`, optional `availableAt`/`expiresAt`, and `payload: {"_type":"message","title":"...","body":"..."}`. A local `actionPath` is optional only when the receipt relates to an existing authenticated `/ai` page. `GET /api/print?jobId=...` reads status; `PATCH` with `{operation:"cancel"|"retry",jobId}` handles a queued/failed job. Retry preserves the job/key and cannot extend its expiry. Never retry by inventing a new key, speak directly to the printer, or recover credentials from historical memory.
