import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/og")({
  server: {
    handlers: {
      // TanStack Start names HTTP method handlers with uppercase keys.
      // oxlint-disable-next-line sonarjs/function-name
      async GET({ request }) {
        const { generateOgImagePng } = await import("@/lib/og-image");
        const url = new URL(request.url);
        const png = await generateOgImagePng({
          title: cleanSearchValue({
            fallback: "Manthan (@nahtnam)",
            maxLength: 120,
            value: url.searchParams.get("title") ?? undefined,
          }),
        });

        return new Response(new Uint8Array(png), {
          headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Type": "image/png",
          },
        });
      },
    },
  },
});

function cleanSearchValue(options: {
  readonly fallback: string;
  readonly maxLength: number;
  readonly value: string | undefined;
}) {
  const { fallback, maxLength, value } = options;
  const normalized = value?.replaceAll(/\s+/gu, " ").trim();

  return normalized ? normalized.slice(0, maxLength) : fallback;
}
