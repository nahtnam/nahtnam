import { readFileSync } from "node:fs";

export const interBold = readAsset({
  path: "../node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf",
});

function readAsset(options: { readonly path: string }) {
  const { path } = options;

  return readFileSync(new URL(path, import.meta.url));
}
