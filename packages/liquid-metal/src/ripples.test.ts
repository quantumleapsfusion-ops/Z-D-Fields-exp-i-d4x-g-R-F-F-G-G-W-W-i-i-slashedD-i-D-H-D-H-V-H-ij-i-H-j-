import { describe, expect, it } from "vitest";

import { Fluid } from "./fluid";
import { voiceRipples } from "./ripples";

const energy = (f: Fluid) => f.velocity.reduce((sum, v) => sum + Math.abs(v), 0);

describe("voiceRipples", () => {
  it("stirs the metal harder the louder the voice", () => {
    const quiet = new Fluid(60, 40);
    const loud = new Fluid(60, 40);
    voiceRipples(quiet, 1, 0.1, 1);
    voiceRipples(loud, 1, 0.8, 1);
    expect(energy(loud)).toBeGreaterThan(energy(quiet) * 4);
  });

  it("moves the drops around the centre as time passes", () => {
    const a = new Fluid(60, 40);
    const b = new Fluid(60, 40);
    voiceRipples(a, 0, 0.5, 1);
    voiceRipples(b, 0.9, 0.5, 1);
    const peak = (f: Fluid) => f.velocity.indexOf(Math.min(...f.velocity));
    expect(peak(a)).not.toBe(peak(b));
  });
});
