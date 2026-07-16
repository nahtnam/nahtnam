import { fileURLToPath } from "node:url";

import posthog from "@posthog/rollup-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import type { PluginOption } from "vite";

import { ogImageAssetsPlugin } from "./og-image-assets-plugin";

const envDir = fileURLToPath(new URL("../..", import.meta.url));

const config = defineConfig(() => {
  const { POSTHOG_PERSONAL_API_KEY, POSTHOG_PROJECT_ID } = process.env;
  const plugins: PluginOption[] = [
    devtools({
      injectSource: {
        enabled: false,
      },
    }),
    tanstackStart(),
    nitro({
      traceDeps: ["@resvg/resvg-js*"],
    }),
    ogImageAssetsPlugin,
    viteReact(),
    tailwindcss(),
  ];

  if (POSTHOG_PERSONAL_API_KEY && POSTHOG_PROJECT_ID) {
    plugins.push(
      posthog({
        personalApiKey: POSTHOG_PERSONAL_API_KEY,
        projectId: POSTHOG_PROJECT_ID,
        sourcemaps: {
          deleteAfterUpload: true,
          enabled: true,
        },
      })
    );
  }

  return {
    envDir,
    optimizeDeps: {
      exclude: ["@resvg/resvg-js", "@resvg/resvg-js-darwin-arm64"],
    },
    plugins,
    resolve: {
      alias: [
        {
          find: /^react-tweet$/u,
          replacement: fileURLToPath(
            new URL("node_modules/react-tweet/dist/index.js", import.meta.url)
          ),
        },
      ],
      tsconfigPaths: true,
    },
    ssr: {
      external: ["@resvg/resvg-js", "@resvg/resvg-js-darwin-arm64"],
      noExternal: ["react-tweet"],
    },
  };
});

export default config;
