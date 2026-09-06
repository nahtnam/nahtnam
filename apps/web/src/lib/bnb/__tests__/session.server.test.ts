/* oxlint-disable sonarjs/no-hardcoded-passwords -- These are isolated cryptography test fixtures. */
import { describe, expect, it, vi } from "vitest";

import {
  clearBnbSessionCookie,
  createBnbSessionCookie,
  getBnbSessionToken,
} from "../session.server";

vi.mock(import("@repo/config/env/server"), () => ({
  serverEnv: {
    WORKOS_API_KEY: "test-api-key",
    WORKOS_CLIENT_ID: "test-client-id",
    WORKOS_COOKIE_PASSWORD: "test-cookie-password-with-32-characters",
    WORKOS_REDIRECT_URI: "https://example.com/api/auth/callback",
  },
}));

describe("Couch BnB session cookies", () => {
  it("round-trips an opaque capability without exposing it", () => {
    const sessionToken = "a".repeat(64);
    const setCookie = createBnbSessionCookie({
      expiresAt: Date.now() + 60_000,
      sessionToken,
    });
    const cookie = setCookie.split(";", 1)[0] ?? "";
    const request = new Request("https://example.com/api/bnb/bookings", {
      headers: { Cookie: cookie },
    });

    expect(cookie).not.toContain(sessionToken);
    expect(getBnbSessionToken(request)).toBe(sessionToken);
  });

  it("rejects a tampered session", () => {
    const setCookie = createBnbSessionCookie({
      expiresAt: Date.now() + 60_000,
      sessionToken: "b".repeat(64),
    });
    const cookie = setCookie.split(";", 1)[0] ?? "";
    const request = new Request("https://example.com/api/bnb/bookings", {
      headers: { Cookie: `${cookie}tampered` },
    });

    expect(getBnbSessionToken(request)).toBeUndefined();
  });

  it("rejects an expired capability", () => {
    const setCookie = createBnbSessionCookie({
      expiresAt: Date.now() - 1000,
      sessionToken: "c".repeat(64),
    });
    const cookie = setCookie.split(";", 1)[0] ?? "";
    const request = new Request("https://example.com/api/bnb/bookings", {
      headers: { Cookie: cookie },
    });

    expect(getBnbSessionToken(request)).toBeUndefined();
  });

  it("clears the scoped cookie", () => {
    expect(clearBnbSessionCookie()).toContain("Max-Age=0");
    expect(clearBnbSessionCookie()).toContain("Path=/api/bnb");
  });
});
