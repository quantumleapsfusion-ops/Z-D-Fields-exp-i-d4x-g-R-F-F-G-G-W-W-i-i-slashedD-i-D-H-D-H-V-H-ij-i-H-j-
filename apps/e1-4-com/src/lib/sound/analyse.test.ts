import { describe, expect, it } from "vitest";

import {
  BANDS,
  FRAMES,
  WAVE_POINTS,
  analyseSound,
  concat,
  fft,
} from "@/lib/sound/analyse";
import { bursts, readSound, soundDensity } from "@/lib/sound/reading";

const RATE = 16000;

function tone(seconds: number, hz: (t: number) => number, gain = 0.5): Float32Array {
  const out = new Float32Array(Math.round(seconds * RATE));
  let phase = 0;
  for (let i = 0; i < out.length; i += 1) {
    phase += (2 * Math.PI * hz(i / RATE)) / RATE;
    out[i] = Math.sin(phase) * gain;
  }
  return out;
}

describe("fft", () => {
  it("turns an impulse into a flat spectrum", () => {
    const re = new Float64Array(8);
    const im = new Float64Array(8);
    re[0] = 1;
    fft(re, im);
    expect([...re]).toEqual(Array(8).fill(1));
    expect([...im].every((v) => Math.abs(v) < 1e-12)).toBe(true);
  });

  it("puts a pure cosine in its own bin", () => {
    const n = 64;
    const re = Float64Array.from({ length: n }, (_, i) =>
      Math.cos((2 * Math.PI * 5 * i) / n),
    );
    const im = new Float64Array(n);
    fft(re, im);
    const mags = [...re].slice(0, n / 2).map((r, k) => Math.hypot(r, im[k]));
    expect(mags.indexOf(Math.max(...mags))).toBe(5);
  });
});

describe("analyseSound", () => {
  it("hears the pitch and brightness of a steady tone", () => {
    const print = analyseSound(
      tone(2, () => 220),
      RATE,
    );
    expect(print.durationMs).toBeCloseTo(2000);
    expect(print.meanPitchHz).toBeGreaterThan(215);
    expect(print.meanPitchHz).toBeLessThan(225);
    expect(print.centroidHz).toBeGreaterThan(150);
    expect(print.centroidHz).toBeLessThan(320);
    expect(print.voicedRatio).toBe(1);
    expect(print.waveform).toHaveLength(WAVE_POINTS);
    expect(print.spectrogram).toHaveLength(FRAMES);
    expect(print.spectrogram[0]).toHaveLength(BANDS);
  });

  it("finds nothing in silence", () => {
    const print = analyseSound(new Float32Array(RATE), RATE);
    expect(print.voicedRatio).toBe(0);
    expect(print.meanPitchHz).toBeNull();
    expect(print.spectrogram.flat().every(Number.isFinite)).toBe(true);
  });
});

describe("readSound", () => {
  it("reads a climbing tone as rising", () => {
    const print = analyseSound(
      tone(3, (t) => 150 * 2 ** t),
      RATE,
    );
    const { candidates, resolvedIndex } = readSound(print);
    const rising = candidates.find((c) => c.form === "spiral");
    expect(rising?.title).toBe("Rising");
    expect(["spiral", "wave"]).toContain(candidates[resolvedIndex].form);
  });

  it("reads bursts separated by silence as pieces", () => {
    const beep = tone(0.25, () => 300);
    const gap = new Float32Array(RATE * 0.35);
    const print = analyseSound(concat(Array(6).fill([beep, gap]).flat()), RATE);
    expect(bursts(print.loudness)).toBe(6);
    expect(readSound(print).candidates.map((c) => c.form)).toContain("lattice");
  });

  it("keeps the density within 0..1", () => {
    const print = analyseSound(
      tone(2, () => 200),
      RATE,
    );
    expect(soundDensity(print)).toBeGreaterThan(0.5);
    expect(soundDensity(print)).toBeLessThanOrEqual(1);
  });
});
