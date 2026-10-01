import { describe, expect, it } from "vitest";

import { circularSpeed, energy, GM, orbiting, step } from "./newton";

function run(b: ReturnType<typeof orbiting>, seconds: number, dt = 1 / 240) {
  for (let t = 0; t < seconds; t += dt) step(b, dt);
}

describe("newton", () => {
  it("circles at r = 1 in 12 seconds", () => {
    expect(circularSpeed(1) * 12).toBeCloseTo(2 * Math.PI, 10);
    expect(GM).toBeCloseTo(((2 * Math.PI) / 12) ** 2, 12);
  });

  it("places an orbiting body at the right radius, moving counter-clockwise", () => {
    const b = orbiting(2, Math.PI / 2);
    expect(b.x).toBeCloseTo(0);
    expect(b.y).toBeCloseTo(2);
    expect(b.vx).toBeLessThan(0);
    expect(b.vy).toBeCloseTo(0);
    expect(Math.hypot(b.vx, b.vy)).toBeCloseTo(circularSpeed(2));
  });

  it("scales speed by the boost factor", () => {
    const slow = orbiting(1.5, 0.3);
    const fast = orbiting(1.5, 0.3, 1.2);
    expect(Math.hypot(fast.vx, fast.vy) / Math.hypot(slow.vx, slow.vy)).toBeCloseTo(1.2);
  });

  it("keeps a circular orbit circular and closes it after one period", () => {
    const b = orbiting(1, 0);
    run(b, 12);
    expect(Math.hypot(b.x, b.y)).toBeCloseTo(1, 2);
    expect(b.x).toBeCloseTo(1, 1);
    expect(b.y).toBeCloseTo(0, 1);
  });

  it("conserves energy to a small drift", () => {
    const b = orbiting(1.3, 1, 1.15);
    const e0 = energy(b);
    run(b, 60);
    expect(Math.abs((energy(b) - e0) / e0)).toBeLessThan(1e-3);
  });

  it("reports bound orbits as negative energy and escape speed as zero", () => {
    expect(energy(orbiting(1, 0))).toBeLessThan(0);
    expect(energy(orbiting(1, 0, Math.SQRT2))).toBeCloseTo(0, 10);
    expect(energy(orbiting(1, 0, 1.5))).toBeGreaterThan(0);
  });

  it("orbits faster closer in (v ∝ r^-1/2)", () => {
    expect(circularSpeed(1) / circularSpeed(4)).toBeCloseTo(2);
  });
});
