const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;

export type OgImageInput = {
  readonly avatarDataUri?: string;
  readonly description: string;
  readonly label: string;
  readonly path: string;
  readonly title: string;
};

type WrapTextOptions = {
  readonly fontSize: number;
  readonly maxLines: number;
  readonly maxWidth: number;
  readonly value: string;
};

export function buildOgImageSvg(input: OgImageInput) {
  const titleLines = wrapText({
    fontSize: 72,
    maxLines: 3,
    maxWidth: 830,
    value: input.title,
  });
  const descriptionLines = wrapText({
    fontSize: 26,
    maxLines: 2,
    maxWidth: 800,
    value: input.description,
  });
  const descriptionY = 304 + (titleLines.length - 1) * 80;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" viewBox="0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}">
  <defs>
    <clipPath id="avatar-clip"><rect x="996" y="132" width="104" height="104" rx="26"/></clipPath>
  </defs>
  <style>
    .sans { font-family: Inter, sans-serif; }
    .mono { font-family: Inter, sans-serif; }
  </style>

  <rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" fill="#fbfbfc"/>
  <text class="sans" x="76" y="72" fill="#181a1f" font-size="25" font-weight="720">manthan</text>
  <text class="mono" x="190" y="71" fill="#4f46e5" font-size="19">↔</text>
  <text class="mono" x="225" y="71" fill="#858b95" font-size="18">@nahtnam</text>
  <text class="mono" x="1124" y="71" fill="#858b95" font-size="17" text-anchor="end">nahtnam.com</text>
  <path d="M76 108 H1124" stroke="#dcdfe4" stroke-width="2"/>

  <text class="mono" x="76" y="171" fill="#4f46e5" font-size="18" font-weight="700" letter-spacing="3">${escapeXml(input.label.toUpperCase())}</text>
  ${renderTextLines({
    className: "sans",
    fill: "#181a1f",
    fontSize: 72,
    fontWeight: 760,
    lineHeight: 80,
    lines: titleLines,
    x: 76,
    y: 252,
  })}
  ${renderTextLines({
    className: "sans",
    fill: "#60656f",
    fontSize: 26,
    fontWeight: 430,
    lineHeight: 38,
    lines: descriptionLines,
    x: 76,
    y: descriptionY,
  })}

  ${renderAvatar({ avatarDataUri: input.avatarDataUri })}
  <circle cx="1048" cy="402" r="42" fill="none" stroke="#4f46e5" stroke-width="2"/>
  <text class="mono" x="1048" y="411" fill="#4f46e5" font-size="28" text-anchor="middle">↔</text>

  <rect x="76" y="546" width="48" height="4" fill="#4f46e5"/>
  <path d="M76 562 H1124" stroke="#dcdfe4" stroke-width="2"/>
  <text class="mono" x="76" y="600" fill="#727782" font-size="18">${escapeXml(input.path)}</text>
  <text class="sans" x="1124" y="600" fill="#181a1f" font-size="19" font-weight="650" text-anchor="end">Software engineer · indie hacker · writer</text>
</svg>`;
}

export async function generateOgImagePng(input: OgImageInput) {
  const { renderOgImagePng } = await import("./og-image-renderer");

  return renderOgImagePng({ input });
}

function renderAvatar(options: { readonly avatarDataUri?: string }) {
  const { avatarDataUri } = options;

  if (!avatarDataUri) {
    return `<rect x="996" y="132" width="104" height="104" rx="26" fill="#f1f2f4"/>
      <text class="sans" x="1048" y="202" fill="#181a1f" font-size="56" font-weight="700" text-anchor="middle">m</text>`;
  }

  return `<rect x="996" y="132" width="104" height="104" rx="26" fill="#f1f2f4"/>
    <image href="${escapeXml(avatarDataUri)}" x="996" y="132" width="104" height="104" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatar-clip)"/>`;
}

function renderTextLines(options: {
  readonly className: string;
  readonly fill: string;
  readonly fontSize: number;
  readonly fontWeight: number;
  readonly lineHeight: number;
  readonly lines: readonly string[];
  readonly x: number;
  readonly y: number;
}) {
  return options.lines
    .map(
      (line, index) =>
        `<text class="${options.className}" x="${options.x}" y="${options.y + index * options.lineHeight}" fill="${options.fill}" font-size="${options.fontSize}" font-weight="${options.fontWeight}">${escapeXml(line)}</text>`
    )
    .join("");
}

function wrapText(options: WrapTextOptions) {
  const words = options.value.replaceAll(/\s+/gu, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  let didTruncate = false;

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    const fitsCurrentLine =
      estimateTextWidth({ fontSize: options.fontSize, value: candidate }) <=
        options.maxWidth || !line;

    if (fitsCurrentLine) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;

      if (lines.length === options.maxLines) {
        didTruncate = true;
        line = "";
        break;
      }
    }
  }

  if (line && lines.length < options.maxLines) {
    lines.push(line);
  }

  if (didTruncate && lines.length > 0) {
    const lastIndex = lines.length - 1;
    let lastLine = lines[lastIndex] ?? "";

    while (
      lastLine &&
      estimateTextWidth({
        fontSize: options.fontSize,
        value: `${lastLine}...`,
      }) > options.maxWidth
    ) {
      lastLine = lastLine.split(" ").slice(0, -1).join(" ");
    }

    lines[lastIndex] =
      `${lastLine || (lines[lastIndex] ?? "").slice(0, 16)}...`;
  }

  return lines;
}

function estimateTextWidth(options: {
  readonly fontSize: number;
  readonly value: string;
}) {
  let width = 0;

  for (const character of options.value) {
    if (character === " ") {
      width += options.fontSize * 0.28;
    } else if (/[A-Z0-9@]/u.test(character)) {
      width += options.fontSize * 0.63;
    } else if (/[il.,'!|]/u.test(character)) {
      width += options.fontSize * 0.28;
    } else {
      width += options.fontSize * 0.52;
    }
  }

  return width;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
