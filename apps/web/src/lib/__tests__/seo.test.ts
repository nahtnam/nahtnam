import { describe, expect, test } from "vitest";

import { buildOgImageSvg } from "../og-image";
import { createSeo, pageSeo } from "../seo";

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
});
