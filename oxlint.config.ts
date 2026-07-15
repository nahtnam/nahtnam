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
