import { afterEach, describe, expect, it, vi } from "vitest";

import { applySecurityHeaders } from "../headers";

vi.mock(import("@repo/config/env/client"), () => ({
  clientEnv: {
    VITE_CONVEX_URL: "https://example.convex.cloud",
  },
}));

describe(applySecurityHeaders, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("adds production browser protections to secure responses", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const response = applySecurityHeaders(
      new Response("ok"),
      new Request("https://example.com")
    );

    const contentSecurityPolicy = response.headers.get(
      "Content-Security-Policy"
    );
    const expectedDirectives = [
      "frame-ancestors 'none'",
      "font-src 'self' data: https://font.ldcr.us",
      "img-src 'self' data: blob: https://workoscdn.com https://example.convex.cloud",
      "style-src 'self' 'unsafe-inline' https://font.ldcr.us",
    ];

    for (const directive of expectedDirectives) {
      expect(contentSecurityPolicy).toContain(directive);
    }
    expect(response.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains"
    );
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    await expect(response.text()).resolves.toBe("ok");
  });

  it("keeps local HTTP responses free of production-only headers", () => {
    vi.stubEnv("NODE_ENV", "test");

    const response = applySecurityHeaders(
      new Response(),
      new Request("http://localhost")
    );

    expect(response.headers.get("Content-Security-Policy")).toBeNull();
    expect(response.headers.get("Strict-Transport-Security")).toBeNull();
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin"
    );
  });
});
