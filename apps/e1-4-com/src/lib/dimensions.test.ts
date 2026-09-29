import { describe, expect, it } from "vitest";

import { byDimension, dimensionOf, neighbour } from "@/lib/dimensions";

describe("dimension ladder", () => {
  it("finds a surface by its longest route prefix", () => {
    expect(dimensionOf("/gravity")?.dimension).toBe(3);
    expect(dimensionOf("/gravity/nested")?.dimension).toBe(3);
    expect(dimensionOf("/profile")).toBeNull();
  });

  it("moves through enabled surfaces and stops at the ends", () => {
    expect(neighbour("/chalkboard", 1)?.href).toBe("/gravity");
    expect(neighbour("/stream", -1)).toBeNull();
    expect(neighbour("/superposition", 1)).toBeNull();
  });

  it("looks up a feature by dimension", () => {
    expect(byDimension(4)?.href).toBe("/horizon");
  });
});
