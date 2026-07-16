import { describe, expect, test } from "vitest";

import { buildOgImageSvg, generateOgImagePng } from "../og-image";
import { createSeo, ogImageUrl, pageSeo } from "../seo";

describe("SEO metadata", () => {
  test("includes accessible social image metadata", () => {
    const seo = createSeo(pageSeo.home);

    expect(seo.meta).toContainEqual({
      content: "Manthan (@nahtnam) — Portfolio",
      property: "og:image:alt",
    });
    expect(seo.meta).toContainEqual({
      content: "Manthan (@nahtnam) — Portfolio",
      name: "twitter:image:alt",
    });
  });

  test("versions generated images to invalidate social preview caches", () => {
    const image = ogImageUrl({
      description: pageSeo.home.description,
      label: pageSeo.home.imageLabel,
      path: pageSeo.home.path,
      title: pageSeo.home.socialTitle,
    });

    expect(new URL(image).searchParams.get("v")).toBe("3");
  });

  test("keeps generated social images indigo-only", () => {
    const svg = buildOgImageSvg({
      description: pageSeo.home.description,
      label: pageSeo.home.imageLabel,
      path: pageSeo.home.path,
      title: pageSeo.home.socialTitle,
    });

    expect(svg).toContain("#4f46e5");
    expect(svg).not.toContain("#e75b3b");
    expect(svg).not.toContain("#2f5ae5");
  });

  test("renders bundled text and avatar assets into a PNG", async () => {
    const png = await generateOgImagePng({
      description: pageSeo.home.description,
      label: pageSeo.home.imageLabel,
      path: pageSeo.home.path,
      title: pageSeo.home.socialTitle,
    });

    expect(png.byteLength).toBeGreaterThan(30_000);
    expect([...png.subarray(0, 8)]).toStrictEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);
  });
});
