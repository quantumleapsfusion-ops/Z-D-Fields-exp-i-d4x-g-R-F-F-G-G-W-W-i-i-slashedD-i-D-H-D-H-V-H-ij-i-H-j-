/**
 * Speaker voiceprint from raw samples: mel-frequency cepstral statistics and pitch, computed with
 * the hand-written FFT in `lib/sound/analyse`. No model, no service; the same code runs in the
 * browser and on the server.
 */
import { detectPitch, fft } from "@/lib/sound/analyse";

export const VOICEPRINT_SAMPLE_RATE = 16_000;
/** Shortest stretch of voiced sound (in frames of 10 ms) worth identifying. */
export const MIN_VOICED_FRAMES = 80;

const FRAME = 400;
const HOP = 160;
const FFT_SIZE = 512;
const MELS = 26;
const CEPS = 16;
const MIN_HZ = 80;
const MAX_HZ = 7600;
const VOICED_DB_BELOW_PEAK = 30;
const SILENCE_RMS = 0.003;

export type Voiceprint = number[];

const hzToMel = (hz: number) => 2595 * Math.log10(1 + hz / 700);
const melToHz = (mel: number) => 700 * (10 ** (mel / 2595) - 1);

function melFilters(sampleRate: number): Float64Array[] {
  const bins = FFT_SIZE / 2 + 1;
  const top = Math.min(MAX_HZ, sampleRate / 2);
  const lo = hzToMel(MIN_HZ);
  const hi = hzToMel(top);
  const edges = Array.from({ length: MELS + 2 }, (_, i) =>
    Math.floor(
      ((FFT_SIZE + 1) * melToHz(lo + ((hi - lo) * i) / (MELS + 1))) / sampleRate,
    ),
  );
  return Array.from({ length: MELS }, (_, m) => {
    const f = new Float64Array(bins);
    const [a, b, c] = [edges[m], edges[m + 1], edges[m + 2]];
    for (let k = a; k < b; k += 1) f[k] = (k - a) / Math.max(1, b - a);
    for (let k = b; k <= c && k < bins; k += 1) f[k] = (c - k) / Math.max(1, c - b);
    return f;
  });
}

const hamming = Float64Array.from(
  { length: FRAME },
  (_, n) => 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (FRAME - 1)),
);

/** Cepstral coefficients 1..CEPS of one frame plus its RMS. */
function frameCepstrum(
  samples: Float32Array,
  start: number,
  filters: Float64Array[],
): { ceps: Float64Array; rms: number } {
  const re = new Float64Array(FFT_SIZE);
  const im = new Float64Array(FFT_SIZE);
  let energy = 0;
  let prev = start > 0 ? samples[start - 1] : 0;
  for (let n = 0; n < FRAME; n += 1) {
    const x = samples[start + n];
    energy += x * x;
    re[n] = (x - 0.97 * prev) * hamming[n];
    prev = x;
  }
  fft(re, im);
  const power = new Float64Array(FFT_SIZE / 2 + 1);
  for (let k = 0; k < power.length; k += 1) power[k] = re[k] * re[k] + im[k] * im[k];
  const logMel = filters.map((f) => {
    let sum = 0;
    for (let k = 0; k < f.length; k += 1) sum += f[k] * power[k];
    return Math.log(sum + 1e-10);
  });
  const ceps = new Float64Array(CEPS);
  for (let c = 1; c <= CEPS; c += 1) {
    let sum = 0;
    for (let m = 0; m < MELS; m += 1)
      sum += logMel[m] * Math.cos((Math.PI * c * (m + 0.5)) / MELS);
    // Liftering by c evens out the scale of low and high coefficients.
    ceps[c - 1] =
      sum * Math.sqrt(2 / MELS) * (1 + (CEPS / 2) * Math.sin((Math.PI * c) / CEPS)) * 0.1;
  }
  return { ceps, rms: Math.sqrt(energy / FRAME) };
}

/**
 * `[mean cepstrum, cepstral spread, pitch]` over the voiced frames, or `null` when there is too
 * little voice to identify anyone.
 */
export function voiceprint(samples: Float32Array, sampleRate: number): Voiceprint | null {
  if (samples.length < FRAME) return null;
  const filters = melFilters(sampleRate);
  const frames: { ceps: Float64Array; rms: number; start: number }[] = [];
  for (let start = 0; start + FRAME <= samples.length; start += HOP) {
    frames.push({ ...frameCepstrum(samples, start, filters), start });
  }
  const peak = Math.max(...frames.map((f) => f.rms));
  const floor = Math.max(SILENCE_RMS, peak * 10 ** (-VOICED_DB_BELOW_PEAK / 20));
  const voiced = frames.filter((f) => f.rms >= floor);
  if (voiced.length < MIN_VOICED_FRAMES) return null;

  const mean = new Array<number>(CEPS).fill(0);
  const spread = new Array<number>(CEPS).fill(0);
  for (const f of voiced)
    for (let c = 0; c < CEPS; c += 1) mean[c] += f.ceps[c] / voiced.length;
  for (const f of voiced)
    for (let c = 0; c < CEPS; c += 1)
      spread[c] += (f.ceps[c] - mean[c]) ** 2 / voiced.length;

  const pitches: number[] = [];
  const window = 1024;
  for (let i = 0; i < voiced.length; i += 4) {
    const start = voiced[i].start;
    if (start + window > samples.length) continue;
    const hz = detectPitch(samples.subarray(start, start + window), sampleRate);
    if (hz) pitches.push(hz);
  }
  pitches.sort((a, b) => a - b);
  const medianPitch = pitches.length ? pitches[Math.floor(pitches.length / 2)] : 150;

  return [...mean, ...spread.map(Math.sqrt), Math.log2(medianPitch / 150) * 2];
}

/** Largest `distance` at which two prints count as the same speaker. */
export const MATCH_DISTANCE = 8.4;

const span = (a: Voiceprint, b: Voiceprint, from: number, to: number) => {
  let sum = 0;
  for (let i = from; i < to; i += 1) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
};

/**
 * How far apart two speakers sound: cepstral envelope, its spread and pitch, weighted so each
 * contributes on a similar scale. `Infinity` for malformed prints.
 */
export function distance(a: Voiceprint, b: Voiceprint): number {
  if (!isVoiceprint(a) || !isVoiceprint(b)) return Infinity;
  return (
    span(a, b, 0, CEPS) +
    2 * span(a, b, CEPS, CEPS * 2) +
    8 * Math.abs(a[CEPS * 2] - b[CEPS * 2])
  );
}

/** Running average of a stored print with a new sample; `count` is how many samples it holds. */
export function blend(stored: Voiceprint, sample: Voiceprint, count: number): Voiceprint {
  const n = Math.min(count, 19);
  return stored.map((v, i) => (v * n + sample[i]) / (n + 1));
}

export function isVoiceprint(value: unknown): value is Voiceprint {
  return (
    Array.isArray(value) &&
    value.length === CEPS * 2 + 1 &&
    value.every((v) => typeof v === "number" && Number.isFinite(v))
  );
}

/** 16-bit little-endian PCM → floats in -1..1. */
export function pcm16ToFloat(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer);
  const out = new Float32Array(Math.floor(buffer.byteLength / 2));
  for (let i = 0; i < out.length; i += 1) out[i] = view.getInt16(i * 2, true) / 32768;
  return out;
}
