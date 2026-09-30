import { describe, expect, it } from "vitest";

import { brand } from "@earth-one/ui";

import { rainbowAt, sampleMask } from "./beadLogo";

const mask = {
  width: 3,
  height: 3,
  cover: new Float32Array([0, 0, 0, 0, 1, 0, 0, 0, 0]),
};

describe("sampleMask", () => {
  it("is full at a covered cell and empty outside the mark", () => {
    expect(sampleMask(mask, 0, 0)).toBe(1);
    expect(sampleMask(mask, 1.2, 0)).toBe(0);
    expect(sampleMask(mask, 0, -1)).toBe(0);
  });

  it("fades between cells", () => {
    expect(sampleMask(mask, 0.5, 0)).toBeCloseTo(0.5);
  });

  it("reads v = 1 as the top row", () => {
    const topRow = { width: 2, height: 2, cover: new Float32Array([1, 1, 0, 0]) };
    expect(sampleMask(topRow, 0, 0.9)).toBeGreaterThan(0.9);
    expect(sampleMask(topRow, 0, -0.9)).toBeLessThan(0.1);
  });
});

describe("rainbowAt", () => {
  it("starts on the first brand colour and ends on the last", () => {
    const hex = (c: [number, number, number]) =>
      `#${c.map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("")}`;
    expect(hex(rainbowAt(0))).toBe(brand.rainbow[0]);
    expect(hex(rainbowAt(1))).toBe(brand.rainbow[brand.rainbow.length - 1]);
    expect(hex(rainbowAt(-3))).toBe(brand.rainbow[0]);
  });
});
