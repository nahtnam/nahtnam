import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const width = 1200;
const height = 630;
const avatarFileName = "assets/images/me-og.jpg";
let cachedAvatarDataUri: string | undefined;

type OgImageInput = {
  readonly description?: string;
  readonly label?: string;
  readonly path?: string;
  readonly title: string;
};

type TextLineOptions = {
  readonly className: string;
  readonly fill: string;
  readonly fontSize: number;
  readonly fontWeight?: number;
  readonly lineHeight: number;
  readonly lines: string[];
  readonly x: number;
  readonly y: number;
};

type TextValueOptions = {
  readonly fallback: string;
  readonly value: string | undefined;
};

type MeasureTextOptions = {
  readonly fontSize: number;
  readonly value: string;
};

type TruncateTextOptions = {
  readonly maxLength: number;
  readonly value: string;
};

type WrapTextOptions = {
  readonly fontSize: number;
  readonly maxLines: number;
  readonly maxWidth: number;
  readonly value: string;
};

function normalizeText(options: TextValueOptions) {
  const { fallback, value } = options;
  const normalized = value?.replaceAll(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function charWidth(options: {
  readonly char: string;
  readonly fontSize: number;
}) {
  const { char, fontSize } = options;

  if (/[A-Z\d]/.test(char)) {
    return fontSize * 0.66;
  }

  if (/[a-z]/.test(char)) {
    return fontSize * 0.54;
  }

  if (char === " " || char === "\t") {
    return fontSize * 0.32;
  }

  return fontSize * 0.42;
}

function measureText(options: MeasureTextOptions) {
  const { fontSize, value } = options;

  return [...value].reduce(
    (total, char) => total + charWidth({ char, fontSize }),
    0,
  );
}

function truncateText(options: TruncateTextOptions) {
  const { maxLength, value } = options;

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trim()}...`;
}

function wrapText(options: WrapTextOptions) {
  const { fontSize, maxLines, maxWidth, value } = options;
  const words = value.split(" ");
  const lines: string[] = [];
  let current = "";
  let didTruncate = false;

  for (const [index, word] of words.entries()) {
    const next = current ? `${current} ${word}` : word;

    if (measureText({ fontSize, value: next }) <= maxWidth) {
      current = next;
      continue;
    }

    if (!current) {
      current = word;
      didTruncate = index < words.length - 1;
      break;
    }

    if (current) {
      lines.push(current);
    }

    if (lines.length === maxLines) {
      current = word;
      didTruncate = true;
      break;
    }

    current = word;
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (didTruncate || lines.length > maxLines) {
    const visibleLines = lines.slice(0, maxLines);
    if (visibleLines.length === 0) {
      return [truncateText({ maxLength: 42, value: current })];
    }

    lines.splice(0, lines.length, ...visibleLines);
    const lastIndex = lines.length - 1;
    let lastLine = lines[lastIndex] ?? "";

    while (measureText({ fontSize, value: `${lastLine}...` }) > maxWidth) {
      const parts = lastLine.split(" ");
      parts.pop();
      lastLine = parts.join(" ");

      if (!lastLine) {
        break;
      }
    }

    lines[lastIndex] = `${lastLine.trim()}...`;
  }

  return lines;
}

function renderTextLines(options: TextLineOptions) {
  const { className, fill, fontSize, fontWeight, lineHeight, lines, x, y } =
    options;

  return lines
    .map((line, index) => {
      const weight = fontWeight ? ` font-weight="${fontWeight}"` : "";
      return `<text class="${className}" x="${x}" y="${y + index * lineHeight}" fill="${fill}" font-size="${fontSize}"${weight}>${escapeXml(line)}</text>`;
    })
    .join("");
}

function getAvatarDataUri() {
  if (cachedAvatarDataUri) {
    return cachedAvatarDataUri;
  }

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const avatarPaths = [
    join(process.cwd(), "public", avatarFileName),
    join(process.cwd(), ".output/public", avatarFileName),
    join(currentDir, "../../public", avatarFileName),
  ];
  const avatarPath = avatarPaths.find((path) => existsSync(path));

  if (!avatarPath) {
    return undefined;
  }

  cachedAvatarDataUri = `data:image/jpeg;base64,${readFileSync(avatarPath).toString("base64")}`;

  return cachedAvatarDataUri;
}

function renderAvatar() {
  const avatarDataUri = getAvatarDataUri();

  if (!avatarDataUri) {
    return `<circle cx="1015" cy="132" r="62" fill="#ede9fe"/>
  <circle cx="1015" cy="132" r="58" fill="#312e81" clip-path="url(#avatar)"/>
  <text class="serif" x="1015" y="154" fill="#ffffff" font-size="84" text-anchor="middle">m</text>`;
  }

  return `<circle cx="1015" cy="132" r="62" fill="#ede9fe"/>
  <circle cx="1015" cy="132" r="58" fill="#ffffff"/>
  <image href="${escapeXml(avatarDataUri)}" x="945" y="62" width="140" height="140" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatar)"/>`;
}

export function buildOgImageSvg(input: OgImageInput) {
  const title = normalizeText({
    fallback: "Manthan (@nahtnam)",
    value: input.title,
  });
  const label = normalizeText({ fallback: "nahtnam", value: input.label });
  const titleLines = wrapText({
    fontSize: 78,
    maxLines: 3,
    maxWidth: 820,
    value: title,
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <clipPath id="avatar">
      <circle cx="1015" cy="132" r="58"/>
    </clipPath>
  </defs>
  <style>
    .sans { font-family: Manrope, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .serif { font-family: "Instrument Serif", Charter, Georgia, "Times New Roman", serif; }
    .mono { font-family: "IBM Plex Mono", "SF Mono", "Cascadia Code", monospace; }
  </style>
  <rect width="${width}" height="${height}" fill="#fdfcff"/>
  <text class="sans" x="80" y="105" fill="#5f6673" font-size="29" font-weight="500">nahtnam / ${escapeXml(label)}</text>
  ${renderAvatar()}
  ${renderTextLines({
    className: "serif",
    fill: "#252936",
    fontSize: 78,
    fontWeight: 400,
    lineHeight: 82,
    lines: titleLines,
    x: 80,
    y: 225,
  })}
  <text class="sans" x="80" y="500" fill="#252936" font-size="28" font-weight="700">manthan</text>
  <text class="sans" x="80" y="536" fill="#6b7280" font-size="28" font-weight="400">@nahtnam</text>
  <text class="sans" x="1120" y="536" fill="#615fff" font-size="28" font-weight="650" text-anchor="end">nahtnam.com</text>
  <rect x="0" y="618" width="${width}" height="12" fill="#615fff"/>
</svg>`;
}

export async function generateOgImagePng(input: OgImageInput) {
  const { Resvg } = await import("@resvg/resvg-js");
  const svg = buildOgImageSvg(input);
  const image = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: width,
    },
    font: {
      loadSystemFonts: true,
    },
  });

  return image.render().asPng();
}
