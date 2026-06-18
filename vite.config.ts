import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const config = defineConfig({
  plugins: [
    devtools({
      injectSource: {
        enabled: false,
      },
    }),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  resolve: {
    alias: [
      {
        find: /^react-tweet$/,
        replacement: fileURLToPath(
          new URL("node_modules/react-tweet/dist/index.js", import.meta.url),
        ),
      },
    ],
  },
  ssr: {
    noExternal: ["react-tweet"],
  },
});

export default config;
