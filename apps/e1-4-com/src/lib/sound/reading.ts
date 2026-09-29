import type { Candidate, Form } from "@/lib/gravity/superposition";

import { FRAMES, type SoundPrint } from "./analyse";

export type SoundReading = { candidates: Candidate[]; resolvedIndex: number };

const semitones = (a: number, b: number) => 12 * Math.log2(b / a);
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const mean = (xs: number[]) =>
  xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;

function percentile(sorted: number[], p: number): number {
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

/** Separate bursts of sound: runs of loud frames split by quiet ones. */
export function bursts(loudness: number[], floor = 0.12): number {
  let count = 0;
  let inside = false;
  for (const v of loudness) {
    if (v > floor && !inside) count += 1;
    inside = v > floor;
  }
  return count;
}

/** Strongest repeat in the loudness envelope as `[strength 0..1, period in frames]`. */
export function pulse(loudness: number[]): [number, number] {
  const m = mean(loudness);
  const centred = loudness.map((v) => v - m);
  const energy = centred.reduce((s, v) => s + v * v, 0) || 1;
  let best: [number, number] = [0, 0];
  for (let lag = 4; lag < Math.min(60, loudness.length / 2); lag += 1) {
    let sum = 0;
    for (let i = 0; i + lag < centred.length; i += 1)
      sum += centred[i] * centred[i + lag];
    if (sum / energy > best[0]) best = [sum / energy, lag];
  }
  return best;
}

/** How much of the recording is sound, and how full that sound is. Drives the event horizon. */
export function soundDensity(print: SoundPrint): number {
  const loud = print.loudness.filter((v) => v > 0.12);
  return clamp(
    print.voicedRatio * 0.5 + mean(loud) * 0.3 + clamp(print.durationMs / 20000) * 0.2,
  );
}

/** Every shape the sound could take, scored from its measurements; the strongest is observed. */
export function readSound(print: SoundPrint): SoundReading {
  const voiced = print.pitch.filter((p): p is number => p !== null);
  const sorted = [...voiced].sort((a, b) => a - b);
  const frameS = print.durationMs / 1000 / FRAMES;
  const readings: (Candidate & { form: Form })[] = [];

  if (sorted.length >= 4) {
    const lo = percentile(sorted, 0.1);
    const hi = percentile(sorted, 0.9);
    const range = semitones(lo, hi);
    readings.push({
      form: "wave",
      title: "A melody",
      interpretation: `Your pitch travelled ${range.toFixed(1)} semitones, between ${Math.round(lo)} and ${Math.round(hi)} Hz.`,
      confidence: clamp(range / 12),
    });
    const third = Math.max(1, Math.floor(voiced.length / 3));
    const start = mean(voiced.slice(0, third));
    const end = mean(voiced.slice(-third));
    const trend = semitones(start, end);
    readings.push({
      form: "spiral",
      title: trend >= 0 ? "Rising" : "Falling",
      interpretation: `Your voice ${trend >= 0 ? "climbed" : "sank"} from ${Math.round(start)} Hz to ${Math.round(end)} Hz.`,
      confidence: clamp(Math.abs(trend) / 6),
    });
  }

  const pieces = bursts(print.loudness);
  readings.push({
    form: "lattice",
    title: "In pieces",
    interpretation: `The sound came in ${pieces} separate burst${pieces === 1 ? "" : "s"} with silence between them.`,
    confidence: clamp((pieces - 1) / 8),
  });

  const bright = print.centroidHz > 1500;
  readings.push({
    form: "knot",
    title: bright ? "Bright and tangled" : "Dark and warm",
    interpretation: `Most of the energy sits around ${Math.round(print.centroidHz)} Hz${bright ? ", where breath and consonants live" : ", down with the vowels and the chest"}.`,
    confidence: clamp(print.centroidHz / 3000),
  });

  const held = print.loudness.filter((v) => v > 0.12);
  const spread = Math.sqrt(mean(held.map((v) => (v - mean(held)) ** 2)));
  readings.push({
    form: "sphere",
    title: "One whole",
    interpretation: `Sound filled ${Math.round(print.voicedRatio * 100)}% of the recording and its loudness held steady.`,
    confidence: clamp((1 - spread * 2.5) * print.voicedRatio),
  });

  const [strength, period] = pulse(print.loudness);
  readings.push({
    form: "torus",
    title: "A rhythm",
    interpretation: `The loudness comes back around every ${(period * frameS).toFixed(1)} seconds.`,
    confidence: clamp(strength),
  });

  const candidates = readings
    .map((r) => ({ ...r, confidence: Math.round(r.confidence * 100) / 100 }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 4);
  return { candidates, resolvedIndex: 0 };
}
