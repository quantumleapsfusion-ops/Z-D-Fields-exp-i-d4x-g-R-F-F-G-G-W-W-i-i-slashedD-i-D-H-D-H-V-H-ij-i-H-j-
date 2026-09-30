import { describe, expect, it } from "vitest";

import { logoAspect, maskFromPixels, sampleMask } from "./beadLogo";

/** 3 × 3 pixels, only the centre is covered. */
const centre = maskFromPixels(
  3,
  3,
  // prettier-ignore
  [
    0, 0, 0, 0,   0, 0, 0, 0,     0, 0, 0, 0,
    0, 0, 0, 0,   255, 0, 0, 255, 0, 0, 0, 0,
    0, 0, 0, 0,   0, 0, 0, 0,     0, 0, 0, 0,
  ],
);

describe("sampleMask", () => {
  it("is full at a covered cell and empty outside the mark", () => {
    expect(sampleMask(centre, 0, 0)).toBe(1);
    expect(sampleMask(centre, 1.2, 0)).toBe(0);
    expect(sampleMask(centre, 0, -1)).toBe(0);
  });

  it("fades between cells", () => {
    expect(sampleMask(centre, 0.5, 0)).toBeCloseTo(0.5);
  });

  it("reads v = 1 as the top row", () => {
    const topRow = maskFromPixels(
      2,
      2,
      [0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0],
    );
    expect(sampleMask(topRow, 0, 0.9)).toBeGreaterThan(0.9);
    expect(sampleMask(topRow, 0, -0.9)).toBeLessThan(0.1);
  });
});

describe("logoAspect", () => {
  it("is height over width", () => {
    expect(logoAspect({ ...centre, width: 2, height: 3 })).toBe(1.5);
  });
});
