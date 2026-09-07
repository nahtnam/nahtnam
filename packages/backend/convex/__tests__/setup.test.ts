/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";

import schema from "../schema";

const modules = import.meta.glob(["../**/*.*s", "!../__tests__/**/*.*s"]);

describe("Convex test environment", () => {
  test("uses deployable module paths", () => {
    const sourcePaths = Object.keys(modules).filter(
      (path) => !path.startsWith("../_generated/")
    );

    expect(sourcePaths.length).toBeGreaterThan(0);
    for (const path of sourcePaths) {
      expect(path.slice(3)).toMatch(/^[\w.]+(?:\/[\w.]+)*$/u);
    }
  });

  test("loads the starter schema", async () => {
    const convex = convexTest(schema, modules);
    const storedFile = await convex.run((ctx) =>
      ctx.db.system.query("_storage").first()
    );

    expect(storedFile).toBeNull();
  });
});
