import { describe, expect, it } from "vitest";

import { ageOnPlanet, planets, sunlightTravelSeconds, weightOn } from "./planets";

describe("planet facts and helpers", () => {
  it("lists the eight planets in order of increasing solar distance", () => {
    expect(planets.map((planet) => planet.name)).toEqual([
      "Mercury",
      "Venus",
      "Earth",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
    ]);
    expect(planets.map((planet) => planet.distanceAU)).toEqual(
      [...planets.map((planet) => planet.distanceAU)].sort((a, b) => a - b),
    );
  });

  it("uses Earth's standard surface gravity as the comparison reference", () => {
    expect(planets[2].gravity).toBeCloseTo(9.8, 1);
  });

  it("identifies Jupiter as most massive and Saturn as having the most known moons", () => {
    expect(planets.reduce((a, b) => (a.massEarths > b.massEarths ? a : b)).name).toBe(
      "Jupiter",
    );
    expect(planets.reduce((a, b) => (a.moons > b.moons ? a : b)).name).toBe("Saturn");
    expect(planets.find((planet) => planet.name === "Saturn")?.moons).toBe(274);
  });

  it("converts Earth weight, light travel time, and age into a planet's terms", () => {
    expect(weightOn(planets[2], 70)).toBeCloseTo(70);
    expect(weightOn(planets[0], 70)).toBeCloseTo((70 * 3.7) / 9.80665, 10);
    expect(sunlightTravelSeconds(planets[2])).toBeCloseTo(499.005);
    expect(ageOnPlanet(planets[3], 10)).toBeCloseTo((10 * 365.256) / 686.98, 6);
  });
});
