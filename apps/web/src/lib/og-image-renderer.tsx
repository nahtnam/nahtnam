import { Buffer } from "node:buffer";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { avatarBase64, interBold, interRegular } from "virtual:og-image-assets";

import type { OgImageInput } from "./og-image";

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;

type RenderOgImageOptions = {
  readonly input: OgImageInput;
};

export async function renderOgImagePng(options: RenderOgImageOptions) {
  const { input } = options;
  const avatarDataUri = `data:image/jpeg;base64,${avatarBase64}`;
  const titleFontSize = getTitleFontSize({ title: input.title });
  const svg = await satori(
    <div
      style={{
        background: "#fbfbfc",
        color: "#181a1f",
        display: "flex",
        fontFamily: "Inter",
        height: IMAGE_HEIGHT,
        position: "relative",
        width: IMAGE_WIDTH,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          left: 76,
          position: "absolute",
          top: 49,
        }}
      >
        <span style={{ fontSize: 25, fontWeight: 700 }}>manthan</span>
        <span style={{ color: "#4f46e5", fontSize: 19, marginLeft: 17 }}>
          ↔
        </span>
        <span style={{ color: "#858b95", fontSize: 18, marginLeft: 17 }}>
          @nahtnam
        </span>
      </div>
      <div
        style={{
          color: "#858b95",
          fontSize: 17,
          position: "absolute",
          right: 76,
          top: 53,
        }}
      >
        nahtnam.com
      </div>
      <div
        style={{
          background: "#dcdfe4",
          height: 2,
          left: 76,
          position: "absolute",
          top: 107,
          width: 1048,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: 340,
          left: 76,
          overflow: "hidden",
          position: "absolute",
          top: 153,
          width: 820,
        }}
      >
        <div
          style={{
            color: "#4f46e5",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {input.label}
        </div>
        <div
          style={{
            fontSize: titleFontSize,
            fontWeight: 700,
            letterSpacing: -2.5,
            lineHeight: 1.08,
            marginTop: 18,
          }}
        >
          {input.title}
        </div>
        <div
          style={{
            color: "#60656f",
            fontSize: 26,
            fontWeight: 400,
            lineHeight: 1.45,
            marginTop: 14,
            maxHeight: 76,
            overflow: "hidden",
          }}
        >
          {input.description}
        </div>
      </div>

      <div
        style={{
          background: "#f1f2f4",
          borderRadius: 26,
          display: "flex",
          height: 104,
          overflow: "hidden",
          position: "absolute",
          right: 100,
          top: 132,
          width: 104,
        }}
      >
        <img
          alt=""
          height={104}
          src={avatarDataUri}
          style={{ objectFit: "cover" }}
          width={104}
        />
      </div>
      <div
        style={{
          alignItems: "center",
          border: "2px solid #4f46e5",
          borderRadius: 999,
          color: "#4f46e5",
          display: "flex",
          fontSize: 28,
          height: 84,
          justifyContent: "center",
          position: "absolute",
          right: 110,
          top: 360,
          width: 84,
        }}
      >
        ↔
      </div>

      <div
        style={{
          background: "#4f46e5",
          height: 4,
          left: 76,
          position: "absolute",
          top: 546,
          width: 48,
        }}
      />
      <div
        style={{
          background: "#dcdfe4",
          height: 2,
          left: 76,
          position: "absolute",
          top: 561,
          width: 1048,
        }}
      />
      <div
        style={{
          color: "#727782",
          fontSize: 18,
          left: 76,
          position: "absolute",
          top: 584,
        }}
      >
        {input.path}
      </div>
      <div
        style={{
          fontSize: 19,
          fontWeight: 700,
          position: "absolute",
          right: 76,
          top: 583,
        }}
      >
        Software engineer · indie hacker · writer
      </div>
    </div>,
    {
      fonts: [
        {
          data: Buffer.from(interRegular),
          name: "Inter",
          style: "normal",
          weight: 400,
        },
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

function getTitleFontSize(options: { readonly title: string }) {
  const { title } = options;

  if (title.length > 72) {
    return 54;
  }

  if (title.length > 48) {
    return 62;
  }

  return 72;
}
