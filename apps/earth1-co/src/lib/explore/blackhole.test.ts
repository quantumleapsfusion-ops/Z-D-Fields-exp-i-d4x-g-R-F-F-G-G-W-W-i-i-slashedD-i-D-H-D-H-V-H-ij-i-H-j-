import { describe, expect, it } from "vitest";

import {
  Msun,
  blackHolePresets,
  evaporationTimeSeconds,
  hawkingTemperature,
  isco,
  photonSphere,
  schwarzschildRadius,
  timeDilation,
} from "./blackhole";

describe("black-hole scales", () => {
  it("gives the Sun a Schwarzschild radius of about 2.95 km", () => {
    expect(schwarzschildRadius(Msun) / 1000).toBeCloseTo(2.95, 1);
  });

  it("gives Sagittarius A* a radius of about 1.27 × 10^10 metres", () => {
    const sgrA = blackHolePresets.find((preset) => preset.id === "sgr-a")!;
    expect(schwarzschildRadius(sgrA.massSolar * Msun)).toBeCloseTo(1.27e10, -8);
  });

  it("gives a one-solar-mass black hole a Hawking temperature near 6.17 × 10^-8 K", () => {
    expect(hawkingTemperature(Msun)).toBeCloseTo(6.17e-8, 9);
  });

  it("returns the expected stationary-clock factor and null inside the horizon", () => {
    expect(timeDilation(1.5)).toBeCloseTo(0.577, 3);
    expect(timeDilation(0.9)).toBeNull();
  });

  it("keeps photon sphere, ISCO, and evaporation time scaled to mass", () => {
    const radius = schwarzschildRadius(Msun);
    expect(photonSphere(Msun)).toBeCloseTo(1.5 * radius);
    expect(isco(Msun)).toBeCloseTo(3 * radius);
    expect(evaporationTimeSeconds(Msun)).toBeGreaterThan(0);
  });
});
