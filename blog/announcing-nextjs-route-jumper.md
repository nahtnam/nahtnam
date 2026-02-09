---
title: "Next.js Route Jumper — A VS Code Extension I Built"
excerpt: "A VS Code extension that lets you instantly jump to any route's source file in Next.js projects."
category: "Software Engineering"
publishedAt: "2026-02-08T00:00:00.000Z"
---

After building [TanStack Route Jumper](https://marketplace.visualstudio.com/items?itemName=nahtnam.tanstack-route-jumper), I wanted the same thing for Next.js. Large Next.js projects with deeply nested route groups, parallel routes, and dynamic segments make it surprisingly annoying to find the source file for a given URL.

So I built [Next.js Route Jumper](https://github.com/nahtnam/nextjs-route-jumper).

## What Does It Do?

Press `Cmd+Shift+R` (or `Ctrl+Shift+R` on Windows/Linux) and you get a searchable list of every route in your project. Select one and it opens the source file directly. You can also open it from the command palette — search for "Next.js Route Jumper: Open".

Each item in the list shows the route path along with its type (`[page]`, `[layout]`, `[template]`, or `[route handler]`) and the file path. You can search by either the URL or the filename.

## How Does It Work?

Unlike the TanStack version which parses a generated file, this one scans your filesystem directly. No build step or generated files required. It finds all route files in your `app/` and `pages/` directories and computes the URL path for each one by analyzing the directory structure.

It supports both the App Router and Pages Router, and handles all the routing conventions you'd expect — route groups, parallel routes, intercepting routes, dynamic segments, catch-all segments, and optional catch-all segments. Private folders prefixed with `_` are excluded automatically.

If you're using both routers in the same project, it merges the results together. App Router entries take priority when there's a clash on the same route path and type.

## Coexistence with TanStack Route Jumper

Both extensions share the same keyboard shortcut. If no `next.config.*` file is found in the workspace, Next.js Route Jumper silently does nothing and lets TanStack Route Jumper handle the shortcut instead. So they work side by side without any configuration.

## How Do I Get It?

You can grab it from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=nahtnam.nextjs-route-jumper) or check out the [source on GitHub](https://github.com/nahtnam/nextjs-route-jumper). It's MIT licensed.

If you're working on a Next.js project with more than a handful of routes, I'd recommend giving it a try.
