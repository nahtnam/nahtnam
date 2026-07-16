import { readFileSync } from "node:fs";

export const avatarBase64 = readAsset({
  path: "../public/assets/images/me-og.jpg",
}).toString("base64");
export const interBold = readAsset({
  path: "../node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf",
});
export const interRegular = readAsset({
  path: "../node_modules/@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf",
});

function readAsset(options: { readonly path: string }) {
  const { path } = options;

  return readFileSync(new URL(path, import.meta.url));
}
