import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import jsPlugins from "ultracite/oxlint/js-plugins";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, jsPlugins, tanstack, vitest, react],
  ignorePatterns: [...(core.ignorePatterns ?? []), "**/.agents/skills/**"],
  overrides: [
    {
      files: ["apps/web/src/routes/**/*.{ts,tsx}"],
      rules: {
        "sort-keys": "off",
      },
    },
    {
      files: [
        "packages/backend/convex/admin/golf_r.ts",
        "packages/backend/convex/admin/seed_golf_r.ts",
        "packages/backend/convex/print_jobs.ts",
        "packages/backend/convex/travel/computeStats.ts",
      ],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
  ],
  rules: {
    "func-style": "off",
    "github/filenames-match-regex": "off",
    "no-use-before-define": "off",
    "node/callback-return": "off",
    "react-doctor/nextjs-no-a-element": "off",
    "typescript/consistent-type-definitions": ["error", "type"],
  },
});
