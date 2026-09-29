import { describe, expect, it } from "vitest";

import {
  gridVertices,
  project,
  screenToSheet,
  viewProjection,
  wellHeight,
} from "./geometry";
import { readSpacetimeAmplitude, setSpacetimeAmplitude } from "./signal";

describe("spacetime geometry", () => {
  it("unprojects a screen point onto the sheet and back", () => {
    const aspect = 16 / 9;
    const m = viewProjection(aspect);
    for (const [x, y] of [
      [0, 0],
      [-0.7, -0.5],
      [0.4, 0.6],
    ]) {
      const hit = screenToSheet(x, y, aspect);
      expect(hit).not.toBeNull();
      const back = project(m, [hit![0], 0, hit![1]]);
      expect(back![0]).toBeCloseTo(x, 4);
      expect(back![1]).toBeCloseTo(y, 4);
    }
  });

  it("misses the sheet above the horizon", () => {
    expect(screenToSheet(0, 1, 1)).toBeNull();
  });

  it("dips deepest at the centre of a well", () => {
    const wells = [[1, -2, 2, 1.5]] as [number, number, number, number][];
    expect(wellHeight(1, -2, wells)).toBeCloseTo(-2);
    expect(wellHeight(4, -2, wells)).toBeGreaterThan(wellHeight(2, -2, wells));
  });

  it("builds whole line segments", () => {
    const v = gridVertices();
    expect(v.length % 6).toBe(0);
    expect(v.length / 3).toBeLessThan(120_000);
  });
});

describe("spacetime amplitude signal", () => {
  it("clamps to 0–1 and rejects NaN", () => {
    setSpacetimeAmplitude(2);
    expect(readSpacetimeAmplitude()).toBe(1);
    setSpacetimeAmplitude(Number.NaN);
    expect(readSpacetimeAmplitude()).toBe(0);
    setSpacetimeAmplitude(0.4);
    expect(readSpacetimeAmplitude()).toBe(0.4);
  });
});
