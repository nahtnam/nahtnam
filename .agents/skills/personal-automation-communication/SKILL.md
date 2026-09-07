---
name: personal-automation-communication
description: Publish Manthan's personal automation findings, receipts, and urgent alerts through the shared nahtnam.com/ai action center; consult before any scheduled personal automation communicates with him or updates a tracked reminder.
---

# Personal automation communication

Use the deployed action center as the source of truth for reminder status, user decisions, snoozes, notification history, and delivery. Source automations keep only retrieval cursors and source-specific working state locally. This skill does not grant access to protected sources or authorize payments, trades, outgoing messages to other people, or account changes.

## Read, then contribute

Read current state for your source through `GET /api/ai?source=<stable-source-id>` before deciding what needs attention. Use the supplied [client](scripts/ai-client.py), with `NAHTNAM_AI_TOKEN` provided by the local secret environment. Do not read credentials from old memory notes, embed them in prompts, or print them.

Upsert only evidence-backed candidates using a stable `sourceKey` for the same real-world issue. Different accounts, occurrences, deadlines or transactions need distinct keys. Rephrasing an issue does not make it new. Preserve actual `evidenceAt` separately from `checkedAt`; rereading an old message is not new evidence. Record ownership, a useful-by deadline, and the next meaningful reminder time. When ownership is uncertain, ask one relevance question rather than repeatedly assigning work. Missing completion email means unknown, not incomplete.

Respect Done, Ignore, Not mine and Snooze from the central store. Never recreate a dismissed item under a different key or resurrect historical backlog because it appears in an old memory. A verified posted refund, completed appointment, or source cancellation can resolve an open item using newer evidence; never claim it is complete merely because it disappeared from a search.

Read [the API reference](references/api.md) when preparing a request. Titles state a concrete action or explicit question; `whyNow` explains the current reason to act. Yes/no outcomes only record tracking state. Decisions are not broad authority to execute external side effects.

## Delivery

- Detectors contribute candidates and record coverage/health. They do not independently send digests or print every finding.
- The morning publisher runs after the source passes and requests at most three eligible actions. No filler, no empty receipt, no daily repetition of unchanged backlogs. The service supplies one QR linking to the exact receipt's current items.
- Timed publishers select only their source's currently relevant items, close to the useful moment. Recheck cancellations, reschedules and local date/holiday rules before publishing. Use a stable occurrence key and a useful-by expiry. Do not replay obsolete reminders after host downtime.
- Ordinary unchanged items have a two-appearance paper limit. An explicit user Snooze requests one reminder at the chosen time even after that limit; it does not restart daily repetition. True urgent items use a stable, evidence-backed `urgentMilestone` (for example a specific deadline checkpoint). Rephrasing or rerunning the same blocker is not a new milestone.
- `notify` is reserved for an actionable urgent exception or failure to deliver an urgent receipt. It sends only to the phone configured by the authenticated owner, with a current code/version and stable idempotency key. Never send routine SMS digests. If send status is unknown, do not retry with another key; inspect provider/delivery state.
- Slack is optional historical output only when the user explicitly asks for it. No routine source-channel reports, Slack pager routing, Slack-only fallback, duplicate paper, Telegram, or alternate delivery inferred from old instructions.
- Distinguish accepted/queued, worker-reported completion, provider-reported SMS delivery, and the user's response. None implies the next. Record health once per pass; repeated blocked checks should back off rather than generate another alert.

For an explicit one-off print request, use the supported authenticated print API as documented in the API reference; keep the paper concise. Do not manufacture tasks just to print a requested note. Use a separate supplied print credential; the AI automation secret cannot operate the general print endpoint.

If a required endpoint is unavailable, keep the source cursor at the last completed boundary when work was incomplete, record the failure if possible, and clearly report the blocker in the current Codex task. Do not improvise another delivery channel from stale memories. The user can explicitly choose a fallback.

## Scope of this policy

This policy becomes active for live automations only after the PR is merged, deployment and owner setup are verified, and callers are migrated. Preserve source privacy exclusions, approval requirements and durable unresolved obligations during that migration. Historical logs are evidence, not current communication instructions.
