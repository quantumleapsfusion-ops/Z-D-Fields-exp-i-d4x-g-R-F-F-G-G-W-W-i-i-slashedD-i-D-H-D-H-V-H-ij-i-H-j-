import { describe, expect, it } from "vitest";

import { WAVE_POINTS, type SoundPrint } from "@/lib/sound/analyse";

import { levelAt, onsets } from "./playback";

const ramp = {
  waveform: Array.from({ length: WAVE_POINTS }, (_, i) => i / (WAVE_POINTS - 1)),
} as SoundPrint;

describe("levelAt", () => {
  it("follows the waveform through the recording", () => {
    expect(levelAt(ramp, 0)).toBe(0);
    expect(levelAt(ramp, 0.5)).toBeCloseTo(0.5, 2);
    expect(levelAt(ramp, 0.999)).toBeCloseTo(0.999, 2);
  });

  it("is silent outside the recording", () => {
    expect(levelAt(ramp, -0.1)).toBe(0);
    expect(levelAt(ramp, 1)).toBe(0);
    expect(levelAt(ramp, Number.NaN)).toBe(0);
  });
});

describe("onsets", () => {
  it("beats once per syllable, not on every loud frame", () => {
    const beat = onsets();
    const levels = [0.1, 0.6, 0.7, 0.65, 0.1, 0.1, 0.8, 0.7, 0.05];
    const beats = levels.filter((l, i) => beat(l, i * 60)).length;
    expect(beats).toBe(2);
  });

  it("merges beats closer than the gap", () => {
    const beat = onsets({ gapMs: 500 });
    expect(beat(0.9, 0)).toBe(true);
    expect(beat(0.1, 100)).toBe(false);
    expect(beat(0.9, 200)).toBe(false);
    expect(beat(0.1, 600)).toBe(false);
    expect(beat(0.9, 700)).toBe(true);
  });
});
