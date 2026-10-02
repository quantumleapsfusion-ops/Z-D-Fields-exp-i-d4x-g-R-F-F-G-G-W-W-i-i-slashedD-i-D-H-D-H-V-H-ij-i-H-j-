import { afterEach, describe, expect, it } from "vitest";

import { readSpacetimeAmplitude, setSpacetimeAmplitude } from "./signal";

afterEach(() => setSpacetimeAmplitude(0));

describe("spacetime amplitude signal", () => {
  it("starts silent", () => {
    expect(readSpacetimeAmplitude()).toBe(0);
  });

  it("stores values in range", () => {
    setSpacetimeAmplitude(0.42);
    expect(readSpacetimeAmplitude()).toBe(0.42);
  });

  it("clamps to 0–1", () => {
    setSpacetimeAmplitude(7);
    expect(readSpacetimeAmplitude()).toBe(1);
    setSpacetimeAmplitude(-3);
    expect(readSpacetimeAmplitude()).toBe(0);
  });

  it("treats NaN and infinities as silence", () => {
    setSpacetimeAmplitude(0.5);
    setSpacetimeAmplitude(Number.NaN);
    expect(readSpacetimeAmplitude()).toBe(0);
    setSpacetimeAmplitude(0.5);
    setSpacetimeAmplitude(Number.POSITIVE_INFINITY);
    expect(readSpacetimeAmplitude()).toBe(0);
  });
});
