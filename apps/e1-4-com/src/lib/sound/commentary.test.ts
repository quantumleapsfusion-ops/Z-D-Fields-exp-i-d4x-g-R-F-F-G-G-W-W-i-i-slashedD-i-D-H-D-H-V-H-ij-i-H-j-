import { describe, expect, it } from "vitest";

import { analyseSound } from "@/lib/sound/analyse";
import { commentOn, narrate, summarise } from "@/lib/sound/commentary";
import { STAGES } from "@/lib/journey";

const RATE = 16000;

function tone(seconds: number, hz: number): Float32Array {
  return Float32Array.from(
    { length: seconds * RATE },
    (_, i) => Math.sin((2 * Math.PI * hz * i) / RATE) * 0.5,
  );
}

describe("commentOn", () => {
  it("describes an entry from its measurements", () => {
    const lines = commentOn(analyseSound(tone(2, 200), RATE));
    expect(lines[0]).toMatch(/^I heard 2\.0 seconds/);
    expect(lines.join(" ")).toMatch(/centred on (19\d|20\d) hertz, in a middle register/);
    expect(lines.at(-1)).toBe("The original is kept in your stream.");
  });

  it("compares with the previous entry", () => {
    const before = summarise(analyseSound(tone(2, 200), RATE));
    const lines = commentOn(analyseSound(tone(4, 400), RATE), before);
    expect(lines.join(" ")).toMatch(/12\.0 semitones higher than your last entry/);
    expect(lines).toContain("You spoke longer than last time.");
  });
});

describe("narrate", () => {
  it("has something to say at every stage", () => {
    const print = analyseSound(tone(1, 200), RATE);
    for (const stage of STAGES)
      expect(narrate(stage.id, print).length).toBeGreaterThan(0);
    expect(narrate("observed", print)).toEqual(commentOn(print));
  });
});
