import { Buffer } from "node:buffer";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { interBold } from "virtual:og-image-assets";

import type { OgImageInput } from "./og-image";

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;

type RenderOgImageOptions = {
  readonly input: OgImageInput;
};

export async function renderOgImagePng(options: RenderOgImageOptions) {
  const { input } = options;
  const titleFontSize = getOgTitleFontSize({ title: input.title });
  const svg = await satori(
    <div
      style={{
        background: "#4f46e5",
        color: "#fbfbfc",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter",
        height: IMAGE_HEIGHT,
        padding: "58px 72px 64px",
        width: IMAGE_WIDTH,
      }}
    >
      <div
        style={{
          color: "rgba(251, 251, 252, 0.78)",
          display: "flex",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        @nahtnam
      </div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          fontSize: titleFontSize,
          fontWeight: 700,
          letterSpacing: -5,
          lineHeight: 0.98,
          maxWidth: 1056,
          overflow: "hidden",
        }}
      >
        {input.title}
      </div>
    </div>,
    {
      fonts: [
        {
          data: Buffer.from(interBold),
          name: "Inter",
          style: "normal",
          weight: 700,
        },
      ],
      height: IMAGE_HEIGHT,
      width: IMAGE_WIDTH,
    }
  );
  const image = new Resvg(svg, {
    fitTo: { mode: "width", value: IMAGE_WIDTH },
  });

  return image.render().asPng();
}

export function getOgTitleFontSize(options: { readonly title: string }) {
  const { title } = options;

  if (title.length > 88) {
    return 72;
  }

  if (title.length > 64) {
    return 82;
  }

  if (title.length > 46) {
    return 94;
  }

  if (title.length > 28) {
    return 112;
  }

  if (title.length > 15) {
    return 144;
  }

  return 184;
}
