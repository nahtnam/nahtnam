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
- **UI fit**: When updating existing product pages, prefer flatter shadcn-style cards and layout patterns over glossy or highly custom visual treatments unless the user explicitly asks for something more expressive.
