# Action center rollout

## Merge gate

This PR adds the admin-only `/ai` action center, central action/decision state, QR receipts, a durable freeform reply inbox, delivery lifecycle and one versioned communication skill. Existing local automations and memory guidance are intentionally migrated **after the user merges this PR**. Do not merge on the user's behalf or activate callers against an unverified deployment.

## Deployment and verification

1. Configure a new random `AI_AUTOMATION_SECRET` identically in the web and Convex production environments. Keep it separate from `PRINT_SECRET`. Supply it to scheduled local jobs as `NAHTNAM_AI_TOKEN` via a secret environment. No credentials belong in git, skill text, automation prompts or memory notes.
2. Deploy the merged backend/schema and web code using the repository's established deployment. Update/restart the receipt worker through its managed supervisor so it understands QR and expiry fields. Do not dirty its checkout.
3. Sign in as the intended WorkOS admin at `/ai`. Initialization binds this personal action center to that authenticated owner. Other users, including other admins, cannot access its private actions. Configure the personal SMS sender number there; no number is guessed or hardcoded. Ordinary website users must fail backend reads/writes even if they directly call Convex.
4. Verify receipt/item deep links survive admin login; scanning is read-only. Verify Done/Snooze/Ignore, explicit question buttons, Undo, old receipt state and source reconciliation before importing real reminders. Submit a freeform reply and confirm it is saved verbatim, labeled as awaiting the next agent run, and visible in machine snapshots until explicitly acknowledged. Reading it must not change its state.
5. Configure `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` for the existing 1-855-NAHTNAM webhook and outbound exceptions. Check current toll-free verification and test an authorized exchange. Confirm Twilio signature checks, sender allowlist and duplicate handling. Owner texts are arbitrary replies saved verbatim; even Y/N waits for agent interpretation. Owner replies and rejected command-like texts must never fall through to paper. Verify ordinary public texts still print within the existing length limit. Verify delivery callbacks, distinguishing accepted from delivered. Never send routine summaries over SMS.
6. Test one paper QR on the actual printer/phone. Confirm expiry, cancellation, failed-job retry with the same key and that delayed host recovery does not print obsolete reminders. Direct SMS-body prefill remains device-dependent; the HTTPS QR is the default.

## Communication instruction migration

Install or link `.agents/skills/personal-automation-communication` into the user's discoverable Codex skills directory from the merged checkout. Validate the installed path. Make that skill the one maintained routing policy.

Replace active communication clauses in all personal automation definitions with a short instruction to read the installed skill. Remove copied Slack channel IDs, raw-report templates, pager rules, independent receipt code, old credential-note paths, and SMS/Telegram alternatives. Preserve source privacy exclusions, account boundaries, source cursors, idempotent source operations and action-specific permissions. Do not apply a global text replacement across unrelated projects.

Inspect the general automation workspace's AGENTS instructions and relevant user/global print guidance. Replace active communication instructions with the same skill pointer, including the shortcut for explicit “print” requests. Review active local skills and helper scripts that still publish to Slack or call the old receipt credential note; migrate their callers or mark obsolete active entrypoints superseded.

For the Codex memory system, use its supported correction mechanism: add one small timestamped note under `~/.codex/memories/extensions/ad_hoc/notes/` stating that the deployed communication skill supersedes legacy personal-automation delivery instructions. Do not directly edit generated MEMORY.md, memory_summary.md or historical rollouts. Old historical reports remain evidence, not instructions. In each automation's own durable memory, retain retrieval cursors and current coverage; move reminder resolution and delivery history to the central store and replace active routing prose with the skill pointer. Reconcile rather than blindly importing or deleting unresolved high-consequence items and expected money.

Finally search active definitions/instructions/scripts for legacy communication rules and verify remaining hits are intentional history or unrelated workflows. Keep a local before/after inventory without credentials and use supported automation_update for definitions, preserving unrelated fields. Do not retain a second authoritative copy of the routing policy in each prompt.

## Fleet changes after deployment

| Existing role | Migration |
| --- | --- |
| Daily Desk Brief | 9am central publisher, after source collectors; ≤3 actions, no filler |
| Upcoming + Reply | Contribute candidates and health before the morning brief; no separate digest |
| Shopping | Money recovery and real deadline collector; verify refunds, reimbursements and card credits against posted transactions |
| Travel | Change-only trip collector plus preparation/leave-time items for selected appointments and trips |
| Inbox Groomer + Calendar Capture | Keep work; revalidate actual source access and read back effects; no guessed timed appointments |
| Signals | Replace Slack router with shared incident/health checks and direct urgent delivery |
| Security | Explicit incident-only owner with real source coverage; no reassurance digest |
| Investing | Retire pre-market and routine daily paper; weekly decision review plus significant changes |
| CFO | Keep weekly decision-oriented pass |
| Relationships | Optional monthly curated item with dismissal |
| Trash + Street Cleaning | Keep date/holiday guards; source-scoped timed publishing with expiry |
| Staples | Keep monthly assistance plus actual credit reconciliation |
| Dormant dashboards/operators | Leave Website Pulse, daily YNAB, QuoteJudge and Edgy growth loops retired; reconcile any finite closure obligations |
| Calendar Receipt Scheduler + Janitor | Keep broad calendar slips paused until verified selective timing; validate the recently replaced Janitor |

Use separate retrieval cursors per source/account and back off known permission failures. Silent successful no-ops are valid. Measure last successful work and coverage, not just launches. Record a shared incident for a blocker; another failed run does not establish a new incident or urgent milestone.

Each migrated automation reads pending replies before its normal work. Source collectors act only on replies attributable to their source; the central coordinator handles general and cross-source replies. Source-filtered snapshots deliberately retain owner-wide pending replies. The agent interprets the wording, applies only authorized changes, verifies durable results, then acknowledges with an outcome. General text, corrections and requests are supported; the inbox is not a Y/N command interpreter. Ambiguous or incomplete replies stay pending. Verify a crash between applying an action and acknowledgment can resume without duplicating that action, and that a queue over 100 can be paged without acknowledging another source's unfinished replies. Start a fresh reply traversal each run; do not persist continuation cursors. Test a scheduled agent run seeing a saved reply before claiming this loop is live.

After two weeks, review useful actions completed, deliberate dismissals, unwanted repetition, missed important obligations, actual background effects and delivery failures. Use findings to tune frequency; do not optimize for report count.
