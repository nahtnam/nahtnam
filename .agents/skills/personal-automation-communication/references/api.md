# Action center API

The web and Convex deployments share a dedicated `AI_AUTOMATION_SECRET`. The local client reads the same value from `NAHTNAM_AI_TOKEN`. Supply it through a secret environment, not a stored prompt or receipt. Browser use goes directly through admin-authorized Convex functions; the machine endpoint does not accept cookies as authorization.

`GET https://www.nahtnam.com/api/ai?source=<source>` returns bounded central state with `coverage` and `truncated` indicators. Do not infer that a missing item is new or resolved when the result is truncated; keep the same source key and report the coverage gap. The general snapshot separates active items from recent closed history, so accumulated history cannot silently hide an active deadline. `POST` to the same endpoint accepts one JSON operation. All timestamps are epoch milliseconds. HTTP responses are private and not cached. On an uncertain response, read back state and retry only with the same source keys/idempotency key.

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
{"operation":"publish","idempotencyKey":"morning:2026-09-08","title":"Today","mode":"actions"}
```

This selects eligible items and queues one receipt with a QR. An empty selection stays silent. `source` optionally scopes selection. For a narrowly timed reminder use `mode: "timed"`, its source, a stable occurrence key, and `expiresAt`. The server caps the useful lifetime. Pending receipts reserve their items to avoid duplicates; only worker-reported completion consumes a paper appearance. Obsolete, expired or cancelled queued receipts release that reservation. Inspect returned status; queued is not proof of paper or attention. Do not bypass item selection by posting a second direct-print copy.

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

`POST /api/print` uses the separately configured print credential. Use `source`, stable `idempotencyKey`, optional `availableAt`/`expiresAt`, and `payload: {"_type":"message","title":"...","body":"..."}`. A local `actionPath` is optional only when the receipt relates to an existing authenticated `/ai` page. `GET /api/print?jobId=...` reads status; `PATCH` with `{operation:"cancel"|"retry",jobId}` handles a queued/failed job. Retry preserves the job/key and cannot extend its expiry. Never retry by inventing a new key, speak directly to the printer, or recover credentials from historical memory.
