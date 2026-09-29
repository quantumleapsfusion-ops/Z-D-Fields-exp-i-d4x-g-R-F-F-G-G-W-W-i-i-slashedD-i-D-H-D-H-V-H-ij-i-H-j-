import { describe, expect, it } from "vitest";

import {
  MATCH_DISTANCE,
  VOICEPRINT_SAMPLE_RATE,
  blend,
  distance,
  isVoiceprint,
  pcm16ToFloat,
  voiceprint,
} from "./voiceprint";

const SR = VOICEPRINT_SAMPLE_RATE;

/** A vowel-like buzz: harmonics of `pitch` shaped by two formants, with syllable-rate gating. */
function voice(pitch: number, formants: [number, number], gain = 0.3, seconds = 2) {
  const out = new Float32Array(SR * seconds);
  for (let i = 0; i < out.length; i += 1) {
    const t = i / SR;
    let s = 0;
    for (let h = 1; h * pitch < 7000; h += 1) {
      const f = h * pitch;
      const shape = formants.reduce((a, fm) => a + 1 / (1 + ((f - fm) / 120) ** 2), 0);
      s += (shape * Math.sin(2 * Math.PI * f * t)) / h;
    }
    out[i] = s * gain * (0.6 + 0.4 * Math.sin(2 * Math.PI * 4 * t));
  }
  return out;
}

describe("voiceprint", () => {
  it("returns null without enough voice", () => {
    expect(voiceprint(new Float32Array(SR * 2), SR)).toBeNull();
    expect(voiceprint(voice(120, [700, 1200]).subarray(0, SR / 4), SR)).toBeNull();
  });

  it("matches the same voice at a different loudness and rejects another voice", () => {
    const a = voiceprint(voice(120, [700, 1200]), SR)!;
    const quieter = voiceprint(voice(120, [700, 1200], 0.08), SR)!;
    const other = voiceprint(voice(220, [400, 2300]), SR)!;
    expect(isVoiceprint(a)).toBe(true);
    expect(distance(a, quieter)).toBeLessThan(MATCH_DISTANCE);
    expect(distance(a, other)).toBeGreaterThan(MATCH_DISTANCE);
  });

  it("never matches malformed prints", () => {
    expect(distance([1, 2, 3], [1, 2, 3])).toBe(Infinity);
  });

  it("blends toward new samples with a capped weight", () => {
    const a = Array(33).fill(0);
    const b = Array(33).fill(1);
    expect(blend(a, b, 1)[0]).toBeCloseTo(0.5);
    expect(blend(a, b, 1000)[0]).toBeCloseTo(0.05);
  });

  it("reads little-endian 16-bit PCM", () => {
    const view = new DataView(new ArrayBuffer(4));
    view.setInt16(0, 16384, true);
    view.setInt16(2, -32768, true);
    expect(Array.from(pcm16ToFloat(view.buffer))).toEqual([0.5, -1]);
  });
});
