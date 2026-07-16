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
          description: cleanSearchValue({
            fallback:
              "Software, startups, personal finance, travel, and developer tools.",
            maxLength: 220,
            value: url.searchParams.get("description") ?? undefined,
          }),
          label: cleanSearchValue({
            fallback: "nahtnam",
            maxLength: 40,
            value: url.searchParams.get("label") ?? undefined,
          }),
          path: cleanSearchValue({
            fallback: "nahtnam.com",
            maxLength: 80,
            value: url.searchParams.get("path") ?? undefined,
          }),
          title: cleanSearchValue({
            fallback: "Manthan (@nahtnam)",
            maxLength: 100,
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
  const normalized = options.value?.replaceAll(/\s+/gu, " ").trim();

  return normalized ? normalized.slice(0, options.maxLength) : options.fallback;
}
