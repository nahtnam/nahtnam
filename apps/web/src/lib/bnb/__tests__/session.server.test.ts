/* oxlint-disable sonarjs/no-hardcoded-passwords -- These are isolated cryptography test fixtures. */
import { describe, expect, it, vi } from "vitest";

import {
  clearBnbSessionCookie,
  createBnbSessionCookie,
  getBnbSessionPassword,
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
  it("round-trips the password without storing it as plaintext", () => {
    const password = "friends-only-secret";
    const setCookie = createBnbSessionCookie({ password });
    const cookie = setCookie.split(";", 1)[0] ?? "";
    const request = new Request("https://example.com/api/bnb/bookings", {
      headers: { Cookie: cookie },
    });

    expect(cookie).not.toContain(password);
    expect(getBnbSessionPassword(request)).toBe(password);
  });

  it("rejects a tampered session", () => {
    const setCookie = createBnbSessionCookie({ password: "secret" });
    const cookie = setCookie.split(";", 1)[0] ?? "";
    const request = new Request("https://example.com/api/bnb/bookings", {
      headers: { Cookie: `${cookie}tampered` },
    });

    expect(getBnbSessionPassword(request)).toBeUndefined();
  });

  it("clears the scoped cookie", () => {
    expect(clearBnbSessionCookie()).toContain("Max-Age=0");
    expect(clearBnbSessionCookie()).toContain("Path=/api/bnb");
  });
});
