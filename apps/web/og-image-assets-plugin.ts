import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { Plugin } from "vite";

const moduleId = "virtual:og-image-assets";
const resolvedModuleId = `\0${moduleId}`;

export const ogImageAssetsPlugin: Plugin = {
  load(id) {
    if (id !== resolvedModuleId) {
      return;
    }

    const avatarBase64 = readAssetBase64({
      url: new URL("public/assets/images/me-og.jpg", import.meta.url),
    });
    const interRegularBase64 = readAssetBase64({
      url: new URL(
        "node_modules/@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf",
        import.meta.url
      ),
    });
    const interBoldBase64 = readAssetBase64({
      url: new URL(
        "node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf",
        import.meta.url
      ),
    });

    return `
      import { Buffer } from "node:buffer";
      const decode = (value) => new Uint8Array(Buffer.from(value, "base64"));
      export const avatarBase64 = ${JSON.stringify(avatarBase64)};
      export const interRegular = decode(${JSON.stringify(interRegularBase64)});
      export const interBold = decode(${JSON.stringify(interBoldBase64)});
    `;
  },
  name: "og-image-assets",
  resolveId(id) {
    if (id === moduleId) {
      return resolvedModuleId;
    }
  },
};

function readAssetBase64(options: { readonly url: URL }) {
  const { url } = options;

  return readFileSync(fileURLToPath(url)).toString("base64");
}
