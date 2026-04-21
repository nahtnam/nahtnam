# Project Instructions

## Maintaining This File

After completing a task, review the conversation for corrections, feedback, or patterns the user pointed out. Distill those into concise, general pointers in the relevant section below. The goal is to prevent future agents from repeating the same mistakes.

- **Do add**: Architectural patterns, conventions, common pitfalls, and how things connect (e.g. which layout provides what context). Keep entries general enough that they won't go stale when files move or rename.
- **Don't add**: File-specific implementation details, temporary workarounds, or anything that duplicates skill/doc content. If a skill already covers it, don't repeat it here.
- **Keep it short**: Each entry should be 1-2 sentences. If it needs more, it belongs in a skill or a memory file instead.

## Agent Rules

DO NOT run the dev server or any database altering CLIs. Do as much as you can, and then provide instructions to the user of what needs to be done prior to running the dev server. Only run the commands if you have explicit permission from the user to execute them.

### Style Guide

- **No comments**: Do not add comments to code unless the logic is non-obvious due to product requirements or business rules that differ from what a developer would naturally expect.
- **within-ts**: Always use `within-ts` primitives (`Define.Error`, `Define.Service`, `Define.Entity`, `Define.Logger`, `Result`, `Cache`, `Schedule`) instead of hand-rolling equivalent patterns. Use `Result` instead of throwing errors, `Define.Error` instead of manual error class boilerplate, `Define.Service` instead of manual DI or global singletons, and `Cache.memoize` instead of manual caching logic. Reference the `within-ts` skill for API details and usage patterns.
- **Portfolio branding**: On personal-facing portfolio surfaces, prefer the real avatar/image for identity treatments like the navbar brand mark instead of abstract monograms.
- **Portfolio palette**: Default to indigo as the primary accent color for the portfolio unless the user explicitly asks for a different color direction.
- **Hero lockups**: Decorative glyphs in hero name treatments should not reserve layout space or push the main name off alignment; keep the visible text aligned and let the ornament live outside the flow.
- **Hero layouts**: In homepage hero sections, avoid reserving empty grid columns or oversized side tracks when companion content is missing; it makes the avatar and status elements feel stranded.
- **Hero portraits**: On desktop portfolio heroes, keep the avatar visually tied to the name and intro block rather than isolating it in a distant side lane.
- **Hero motion**: Keep hero name animation stable at rest; avoid autoplay states that can leave the primary lockup looking broken in screenshots or on first load.
- **Matched chips**: When presenting a small pair of personal tags or badges, make them feel intentionally matched in scale and width rather than leaving one visibly smaller.
- **UI fit**: When updating existing product pages, prefer flatter shadcn-style cards and layout patterns over glossy or highly custom visual treatments unless the user explicitly asks for something more expressive.
- **Distinct modules**: On the homepage, adjacent sections with different jobs should not share nearly identical treatments; editorial content like latest writing should feel meaningfully different from metadata rows such as company chips.
- **Public timelines**: Future-dated entries should stay out of public-facing queries and derived stats until their date has arrived; admins can still see and manage them.
- **Convex schema changes**: When adding fields to existing tables, make the field optional first or include an explicit backfill path so older documents do not fail schema validation before migration runs.
- **Admin auth**: Admin access should use WorkOS-backed identity and server-side Convex authorization by allowed email. Do not reintroduce shared secrets in query params, cookies, or client-passed mutation arguments.
