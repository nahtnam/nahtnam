# Project Instructions

- Do not run dev servers or database-altering CLIs without explicit user permission. Complete static work first, then tell the user which interactive commands remain.
- Treat this repository as a reusable app starter. Keep applications unscoped, reserve `@repo/*` for internal packages, put shared app and environment configuration in `@repo/config`, and keep Convex source in `packages/backend/convex`.
- Run Convex CLI commands from the repository root with `bun convex`. The backend package owns `convex.json` and the `convex` source directory; the repository root owns the shared environment and AI skills. Read `packages/backend/convex/_generated/ai/guidelines.md` before changing Convex code.
- For WorkOS AuthKit, keep sign-in and sign-up distinct, redirect login to `/app` and logout to `/`, use the public portless URL for local callbacks, and use the SDK's standard server environment variables. Use the client `signOut()` flow for browser-initiated logout.
- Put values shared by browser and server code in `@repo/config/env/client` with a `VITE_` name. Use the canonical `appUrl` unless the browser genuinely needs a runtime environment value.
- In a custom TanStack Start `src/start.ts`, keep same-origin CSRF validation before authentication middleware. Do not set the router's global `defaultPendingMs` to `0`, which can replace server-rendered HTML during hydration.
- Use `convex-route-query` for Convex route loaders and React queries. Do not enable global `expectAuth` while public routes can subscribe logged out; enforce private access in protected layouts and Convex functions.
- Use PostHog SDKs directly and keep their established environment variable names. Send Convex logs and errors through dashboard integrations; use `@posthog/convex` for backend events and flags, and keep build credentials separate from runtime project tokens.
- Keep Migrations and Workflow registered as starter defaults. Workpool is Workflow's peer and should only be mounted separately for an independent pool; add other Convex components only for concrete product needs.
- Treat TanStack Start as the public HTTP and integration boundary. Implement webhooks, callbacks, and custom API endpoints as TanStack Start server routes; validate and authenticate requests there, then use Convex for durable data changes and background work. Do not add Convex HTTP actions unless a concrete platform constraint requires one.
- Let browser code call Convex directly for application queries and routine authenticated mutations, including CRUD operations and form submissions. Do not proxy these operations through TanStack Start.
- Keep durable state, authorization enforcement, business mutations, scheduled work, and background jobs in Convex. Use mutations for database writes and actions only when external side effects or runtime capabilities require them. Define functions through the shared Fluent Convex builder and authenticated chains; use native Convex entry points for schemas, crons, and component configuration.
- Use FormAdapter for straightforward web forms. Keep `DaisyUIProvider` at the app root, create provider-neutral forms from `@formadapter/react`, submit to Convex through ordinary `onSubmit` handlers, and add `@formadapter/tanstack-start` only for TanStack Start server functions.
- Keep at least one representative starter test, with component tests under `__tests__`. Do not invent backend behavior solely for a sample test.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `packages/backend/convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->
