import type { ResvgRenderOptions } from "@resvg/resvg-js";
import { avatarBase64, interBold, interRegular } from "virtual:og-image-assets";

import { buildOgImageSvg } from "./og-image";
import type { OgImageInput } from "./og-image";

const IMAGE_WIDTH = 1200;

type ResvgFontOptions = NonNullable<ResvgRenderOptions["font"]> & {
  readonly fontBuffers: readonly Uint8Array[];
};

type RenderOgImageOptions = {
  readonly input: OgImageInput;
};

export async function renderOgImagePng(options: RenderOgImageOptions) {
  const { input } = options;
  const { Resvg } = await import("@resvg/resvg-js");
  const font = {
    defaultFontFamily: "Inter",
    fontBuffers: [interRegular, interBold],
    loadSystemFonts: false,
    monospaceFamily: "Inter",
    sansSerifFamily: "Inter",
  } satisfies ResvgFontOptions;
  const avatarDataUri = `data:image/jpeg;base64,${avatarBase64}`;
  const image = new Resvg(
    buildOgImageSvg({
      ...input,
      avatarDataUri,
    }),
    {
      fitTo: { mode: "width", value: IMAGE_WIDTH },
      font,
    }
  );

  return image.render().asPng();
}
