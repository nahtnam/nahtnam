import { describe, expect, test } from "vitest";

import { generateOgImagePng } from "../og-image";
import { getOgTitleFontSize } from "../og-image-renderer";
import { createSeo, ogImageUrl, pageSeo } from "../seo";

describe("SEO metadata", () => {
  test("includes accessible social image metadata", () => {
    const seo = createSeo(pageSeo.home);
    const expectedAlt =
      "Social preview reading “Manthan (@nahtnam)” for @nahtnam";

    expect(seo.meta).toContainEqual({
      content: expectedAlt,
      property: "og:image:alt",
    });
    expect(seo.meta).toContainEqual({
      content: expectedAlt,
      name: "twitter:image:alt",
    });
  });

  test("versions minimal generated image URLs to invalidate preview caches", () => {
    const image = ogImageUrl({ title: pageSeo.home.socialTitle });
    const imageUrl = new URL(image);

    expect(imageUrl.searchParams.get("v")).toBe("4");
    expect([...imageUrl.searchParams.keys()]).toStrictEqual(["title", "v"]);
  });

  test("gives every public page a large-card image with matching Twitter metadata", () => {
    for (const seoOptions of Object.values(pageSeo)) {
      const seo = createSeo(seoOptions);
      const ogImage = seo.meta.find((meta) => meta.property === "og:image");
      const twitterImage = seo.meta.find(
        (meta) => meta.name === "twitter:image"
      );

      expect(ogImage?.content).toBeTruthy();
      expect(twitterImage?.content).toBe(ogImage?.content);
      expect(seo.meta).toContainEqual({
        content: "summary_large_image",
        name: "twitter:card",
      });
      expect(seo.meta).toContainEqual({
        content: "1200",
        property: "og:image:width",
      });
      expect(seo.meta).toContainEqual({
        content: "630",
        property: "og:image:height",
      });
    }
  });

  test("keeps headlines readable across representative title lengths", () => {
    expect(getOgTitleFontSize({ title: "Blog" })).toBe(184);
    expect(
      getOgTitleFontSize({
        title: "Next.js Route Jumper — A VS Code Extension I Built",
      })
    ).toBe(94);
    expect(getOgTitleFontSize({ title: "x".repeat(100) })).toBe(72);
  });

  test("renders bundled headline text into a PNG", async () => {
    const png = await generateOgImagePng({
      title: "What Mattered While Building Mercury Command",
    });

    expect(png.byteLength).toBeGreaterThan(20_000);
    expect([...png.subarray(0, 8)]).toStrictEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);
  });
});
