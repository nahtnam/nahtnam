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
- **No within-ts**: Do not add `within-ts` to this project. It pulls Node-only APIs into bundles and can break Convex functions that run outside the Node runtime.
- **Portfolio branding**: On personal-facing portfolio surfaces, prefer the real avatar/image for identity treatments like the navbar brand mark instead of abstract monograms.
- **Portfolio palette**: Default to indigo as the primary accent color for the portfolio unless the user explicitly asks for a different color direction.
- **Site backgrounds**: Do not use site-wide grid or dotted-grid background patterns; prefer soft continuous color fields or simple surfaces.
- **Hero lockups**: Decorative glyphs in hero name treatments should not reserve layout space or push the main name off alignment; keep the visible text aligned and let the ornament live outside the flow.
- **Hero layouts**: In homepage hero sections, avoid reserving empty grid columns or oversized side tracks when companion content is missing; it makes the avatar and status elements feel stranded.
- **Hero portraits**: On desktop portfolio heroes, keep the avatar visually tied to the name and intro block rather than isolating it in a distant side lane.
- **Hero motion**: Keep hero name animation stable at rest; avoid autoplay states that can leave the primary lockup looking broken in screenshots or on first load.
- **Matched chips**: When presenting a small pair of personal tags or badges, make them feel intentionally matched in scale and width rather than leaving one visibly smaller.
- **Inline chip text**: When a compact chip mixes text sizes or font families on one row, align the text runs by baseline and tighten their line-height so they do not look vertically mismatched.
- **UI fit**: When updating existing product pages, prefer flatter shadcn-style cards and layout patterns over glossy or highly custom visual treatments unless the user explicitly asks for something more expressive.
- **Utility pages**: For focused tools like timers or calculators, keep the surface minimal, honor browser color-scheme preference with an explicit override, use the site theme tokens by default, and hide advanced configuration behind an icon-triggered settings surface.
- **Clock utilities**: For timer or clock-focused pages, make the clock the dominant viewport element and keep surrounding labels, progress, and controls visually secondary.
- **Utility persistence**: When storing local progress for utility pages, persist raw event records with timestamps and settings snapshots so future UI can derive new summaries without losing detail.
- **Distinct modules**: On the homepage, adjacent sections with different jobs should not share nearly identical treatments; editorial content like latest writing should feel meaningfully different from metadata rows such as company chips.
- **Public timelines**: Future-dated entries should stay out of public-facing queries and derived stats until their date has arrived; admins can still see and manage them.
- **Convex schema changes**: When adding fields to existing tables, make the field optional first or include an explicit backfill path so older documents do not fail schema validation before migration runs.
- **Convex field removal**: Before removing a field from the Convex schema, verify production documents no longer contain that key at all; an empty string or null-like placeholder can still fail schema validation on deploy.
- **Admin auth**: Admin access should use WorkOS-backed identity and server-side Convex authorization by allowed email. Do not reintroduce shared secrets in query params, cookies, or client-passed mutation arguments.
- **Boilerplate updates**: When syncing from the Vertex template with Patchworks, treat the generated diff as a proposal and preserve intentional removals from this repo. If dependency versions change, reset the lockfile and regenerate it with `bun install` instead of hand-editing lockfile changes.
- **Convex route queries**: In TanStack Start routes and React components, use `createConvexRouteQuery` from `convex-route-query` for Convex queries. Use its `fetchQuery`/`prefetchQuery` helpers in route loaders and its `useSuspenseQuery` hook in components instead of calling lower-level Convex React Query helpers directly.
- **Route query preloading**: Any route component that calls a Convex route query hook should preload the same helper in that route's loader/beforeLoad with matching args. Prefer splitting create/edit or conditional surfaces so components can use `useSuspenseQuery` instead of guarded non-suspense queries.
- **Convex auth startup**: Match Vertex auth wiring first: route loaders may set `serverHttpClient` auth for SSR, browser auth should flow through `ConvexProviderWithAuth` and the Vertex-style AuthKit adapter, and auth-gated routes should be handled by a protected layout instead of root-level clear/reset side effects.
- **Public Convex queries**: Do not enable global Convex `expectAuth` while public routes subscribe to Convex data. It can pause the browser websocket for logged-out users; keep auth requirements in protected route layouts and server-side Convex authorization instead.
- **WorkOS redirect config**: Configure AuthKit session during server startup with the same canonical callback URL passed to the WorkOS middleware. This app derives that URL from `appUrl`; do not rely on an unused `WORKOS_REDIRECT_URI` server env var.
- **Admin query pages**: Use `createConvexRouteQuery(...).useSuspenseQuery(...)` for admin list data. For conditional queries that need guards like `enabled`, use the route query's `useQuery` helper.
- **X thread imports**: For X-origin blog posts, prefer accepting the last tweet URL and walking backward through `in_reply_to_status_id_str`, then reverse the collected tweets before rendering. Treat manual ordered tweet URLs as an escape hatch when parent data is missing, private, or crosses authors unexpectedly.
- **Blog content ownership**: Long-form Markdown post bodies should live in `content/blog` for git/AI editing, with Convex owning metadata, publish state, media records, and X-thread cache data. Public rendering should resolve Convex `contentPath` values through the bundled Markdown registry and fall back to legacy Convex `content` only for migration safety.
