import { type FlatXoConfig } from "xo";
import convexPlugin from "@convex-dev/eslint-plugin";
import routerPlugin from "@tanstack/eslint-plugin-router";

const xoConfig: FlatXoConfig = [
  {
    prettier: "compat",
    react: true,
    space: 2,
  },
  ...convexPlugin.configs.recommended, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  ...routerPlugin.configs["flat/recommended"],
  {
    files: ["src/routeTree.gen.ts", "convex/_generated/*"],
    rules: {
      "unicorn/no-abusive-eslint-disable": "off",
    },
  },
  {
    files: ["convex/**/*"],
    rules: {
      "no-await-in-loop": "off",
    },
  },
  {
    ignores: [
      "src/components/ui/**/*",
      "src/lib/shadcn/*",
      ".agents/skills/**/*",
    ],
  },
  {
    rules: {
      "@stylistic/indent": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/only-throw-error": "off",
      "import-x/extensions": "off",
      "new-cap": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "sort-keys": "error",
    },
  },
];

export default xoConfig;
