import { describe, expect, test } from "vitest";

import {
  adminReturnPath,
  adminSignInPath,
  callbackReturnPath,
  isAdminPath,
} from "../admin-return";

describe("administrator return destinations", () => {
  test.each(["/ai", "/ai/r/receipt_123", "/ai/item/A7", "/admin/travel/"])(
    "preserves the private destination %s",
    (path) => {
      expect(adminReturnPath(path)).toBe(path);
      expect(callbackReturnPath(path)).toBe(path);
      expect(
        new URL(adminSignInPath(path), "https://example.com").searchParams.get(
          "returnTo"
        )
      ).toBe(path);
    }
  );

  test.each([
    "https://evil.example/ai",
    "//evil.example/ai",
    "/ai\\evil",
    "/ai/../public",
    "/ai/%2e%2e/public",
    "/ai/%252f%252fevil.example",
    "/ai//evil.example",
    "/ai?next=https://evil.example",
    "/ai#fragment",
    "/ai\r\nLocation: https://evil.example",
    "/ai\n",
    "/admin\r",
    "/airplane",
    "/api/auth/admin",
    "",
  ])("rejects untrusted destination %j", (path) => {
    expect(isAdminPath(path)).toBeFalsy();
    expect(adminReturnPath(path)).toBe("/admin");
    expect(callbackReturnPath(path)).toBe("/app");
  });

  test("ordinary sign-in still lands in the application", () => {
    expect(callbackReturnPath("/app")).toBe("/app");
    expect(callbackReturnPath("/")).toBe("/app");
    expect(adminReturnPath()).toBe("/admin");
  });
});
