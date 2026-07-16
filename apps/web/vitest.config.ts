import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { ogImageAssetsPlugin } from "./og-image-assets-plugin";

export default defineConfig({
  plugins: [ogImageAssetsPlugin, viteReact()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    env: {
      VITE_CONVEX_URL: "https://example.convex.cloud",
    },
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
