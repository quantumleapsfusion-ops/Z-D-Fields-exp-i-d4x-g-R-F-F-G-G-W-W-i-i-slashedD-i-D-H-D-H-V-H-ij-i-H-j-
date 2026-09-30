import { describe, expect, it } from "vitest";

import { Fluid } from "./fluid";

describe("Fluid", () => {
  it("settles onto its target and stays finite", () => {
    const f = new Fluid(40, 30);
    f.target.fill(0.5);
    for (let i = 0; i < 600; i += 1) f.step(1 / 60);
    for (const h of f.height) {
      expect(Number.isFinite(h)).toBe(true);
      expect(h).toBeCloseTo(0.5, 2);
    }
  });

  it("overshoots on the way to a new shape (liquid, not a tween)", () => {
    const f = new Fluid(30, 30);
    f.target.fill(1);
    let peak = 0;
    for (let i = 0; i < 120; i += 1) {
      f.step(1 / 60);
      peak = Math.max(peak, f.height[15 * 30 + 15]);
    }
    expect(peak).toBeGreaterThan(1.02);
  });

  it("spreads a splash outward as a ring", () => {
    const f = new Fluid(60, 60);
    f.splash(30, 30, 2, -10);
    f.step(0.05);
    const centreEarly = f.height[30 * 60 + 30];
    expect(centreEarly).toBeLessThan(0);
    for (let i = 0; i < 20; i += 1) f.step(1 / 60);
    const far = f.height[30 * 60 + 42];
    expect(Math.abs(far)).toBeGreaterThan(1e-4);
    expect(f.height[30 * 60 + 30]).toBeGreaterThan(centreEarly);
  });

  it("clamps huge frame gaps", () => {
    const f = new Fluid(10, 10);
    f.splash(5, 5, 1, -100);
    f.step(30);
    for (const h of f.height) expect(Number.isFinite(h)).toBe(true);
  });
});
