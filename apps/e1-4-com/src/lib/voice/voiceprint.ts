/**
 * Voice identity — pure maths shared by the browser (feature extraction) and
 * the server (matching). No DOM or Node APIs in here.
 *
 * A voice print is a fixed-length, unit-normalised vector summarising the
 * long-term spectrum of someone saying their voice name: per-band log energy
 * mean + spread, plus a few global timbre statistics. Enrolment averages
 * several utterances; verification compares by cosine similarity after the
 * spoken phrase itself has matched.
 *
 * This is a lightweight spectral signature, not a neural speaker embedding —
 * it separates voices well enough to act as an identity key for a small
 * community, and `matchVoicePrint` is the single seam to swap in a stronger
 * speaker-verification provider later.
 */

export const BAND_COUNT = 24;
export const MIN_HZ = 80;
export const MAX_HZ = 7600;
/** mean[BAND_COUNT] + std[BAND_COUNT] + centroid, rolloff, flatness, slope */
export const EMBEDDING_SIZE = BAND_COUNT * 2 + 4;
/** Cosine similarity at or above which two prints are treated as the same voice. */
export const MATCH_THRESHOLD = 0.9;
/** Frames whose loudest bin is below this (dBFS) are silence and are not folded into the print. */
export const SILENCE_DB = -60;
/** Minimum voiced frames before a print is considered stable enough to use. */
export const MIN_VOICED_FRAMES = 20;

/** Log-spaced band edges in Hz. */
export function bandEdges(count = BAND_COUNT, min = MIN_HZ, max = MAX_HZ): number[] {
  const edges: number[] = [];
  const ratio = Math.log(max / min);
  for (let i = 0; i <= count; i++) edges.push(min * Math.exp((ratio * i) / count));
  return edges;
}

/**
 * Per-frame features from an FFT magnitude spectrum in dB (as produced by
 * `AnalyserNode.getFloatFrequencyData`). Returns `null` for silent frames.
 */
export function frameFeatures(
  spectrumDb: ArrayLike<number>,
  sampleRate: number,
  edges: number[] = bandEdges(),
): {
  bands: number[];
  centroid: number;
  rolloff: number;
  flatness: number;
  slope: number;
} | null {
  const bins = spectrumDb.length;
  const hzPerBin = sampleRate / 2 / bins;

  let peak = -Infinity;
  for (let i = 0; i < bins; i++) if (spectrumDb[i] > peak) peak = spectrumDb[i];
  if (!(peak >= SILENCE_DB)) return null;

  const bands = new Array<number>(edges.length - 1).fill(0);
  const counts = new Array<number>(edges.length - 1).fill(0);
  let power = 0;
  let weighted = 0;
  let logSum = 0;
  let used = 0;
  let xy = 0;
  let xx = 0;
  let xMean = 0;
  let yMean = 0;

  const lo = Math.max(1, Math.floor(edges[0] / hzPerBin));
  const hi = Math.min(bins - 1, Math.ceil(edges[edges.length - 1] / hzPerBin));
  for (let i = lo; i <= hi; i++) {
    const hz = i * hzPerBin;
    const db = Math.max(spectrumDb[i], -120);
    const mag = Math.pow(10, db / 20);
    const p = mag * mag;
    power += p;
    weighted += p * hz;
    logSum += Math.log(p + 1e-12);
    used++;
    xMean += Math.log(hz);
    yMean += db;
    let b = 0;
    while (b < bands.length - 1 && hz >= edges[b + 1]) b++;
    bands[b] += db;
    counts[b]++;
  }
  if (power <= 0 || used === 0) return null;

  for (let b = 0; b < bands.length; b++) {
    bands[b] = counts[b] ? bands[b] / counts[b] : -120;
  }

  const centroid = weighted / power;
  let acc = 0;
  let rolloff = MAX_HZ;
  for (let i = lo; i <= hi; i++) {
    const mag = Math.pow(10, Math.max(spectrumDb[i], -120) / 20);
    acc += mag * mag;
    if (acc >= power * 0.85) {
      rolloff = i * hzPerBin;
      break;
    }
  }
  const geometric = Math.exp(logSum / used);
  const flatness = geometric / (power / used);

  xMean /= used;
  yMean /= used;
  for (let i = lo; i <= hi; i++) {
    const x = Math.log(i * hzPerBin) - xMean;
    xy += x * (Math.max(spectrumDb[i], -120) - yMean);
    xx += x * x;
  }
  const slope = xx > 0 ? xy / xx : 0;

  return { bands, centroid, rolloff, flatness, slope };
}

export type Frame = NonNullable<ReturnType<typeof frameFeatures>>;

/** Fold voiced frames into a unit-normalised embedding. */
export function buildEmbedding(frames: Frame[]): number[] {
  if (frames.length === 0) throw new Error("No voiced frames");
  const n = frames.length;
  const bandCount = frames[0].bands.length;
  const mean = new Array<number>(bandCount).fill(0);
  const sq = new Array<number>(bandCount).fill(0);
  let centroid = 0;
  let rolloff = 0;
  let flatness = 0;
  let slope = 0;
  for (const f of frames) {
    for (let b = 0; b < bandCount; b++) {
      mean[b] += f.bands[b];
      sq[b] += f.bands[b] * f.bands[b];
    }
    centroid += f.centroid;
    rolloff += f.rolloff;
    flatness += f.flatness;
    slope += f.slope;
  }
  const out: number[] = [];
  // Band means relative to the frame's overall level, so mic gain cancels out.
  const level = mean.reduce((a, b) => a + b, 0) / bandCount / n;
  for (let b = 0; b < bandCount; b++) out.push((mean[b] / n - level) / 20);
  for (let b = 0; b < bandCount; b++) {
    const variance = Math.max(0, sq[b] / n - (mean[b] / n) ** 2);
    out.push(Math.sqrt(variance) / 20);
  }
  out.push(Math.log(centroid / n / 1000));
  out.push(Math.log(rolloff / n / 1000));
  out.push(flatness / n);
  out.push(slope / n / 10);
  return normalise(out);
}

export function normalise(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((a, x) => a + x * x, 0));
  if (!Number.isFinite(norm) || norm === 0) throw new Error("Degenerate embedding");
  return v.map((x) => x / norm);
}

export function cosine(a: ArrayLike<number>, b: ArrayLike<number>): number {
  if (a.length !== b.length) return -1;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return -1;
  return dot / Math.sqrt(na * nb);
}

/** Accept only well-formed unit vectors from the client. */
export function isValidEmbedding(v: unknown): v is number[] {
  if (!Array.isArray(v) || v.length !== EMBEDDING_SIZE) return false;
  let norm = 0;
  for (const x of v) {
    if (typeof x !== "number" || !Number.isFinite(x)) return false;
    norm += x * x;
  }
  return Math.abs(Math.sqrt(norm) - 1) < 1e-3;
}

/** Running mean of `count` prior samples with one more, re-normalised. */
export function mergeEmbedding(
  existing: number[],
  count: number,
  incoming: number[],
): number[] {
  const merged = existing.map((x, i) => (x * count + incoming[i]) / (count + 1));
  return normalise(merged);
}

/** Average several enrolment utterances into one print. */
export function averageEmbeddings(samples: number[][]): number[] {
  if (samples.length === 0) throw new Error("No samples");
  const out = new Array<number>(samples[0].length).fill(0);
  for (const s of samples) for (let i = 0; i < out.length; i++) out[i] += s[i];
  return normalise(out.map((x) => x / samples.length));
}

export type VoiceCandidate<T> = { id: T; embedding: number[] };

/**
 * Pick the best-matching enrolled print for a fresh one, or `null` when nobody
 * clears `threshold`. Candidates should already share the spoken phrase.
 */
export function matchVoicePrint<T>(
  probe: number[],
  candidates: VoiceCandidate<T>[],
  threshold = MATCH_THRESHOLD,
): { id: T; score: number } | null {
  let best: { id: T; score: number } | null = null;
  for (const c of candidates) {
    const score = cosine(probe, c.embedding);
    if (!best || score > best.score) best = { id: c.id, score };
  }
  return best && best.score >= threshold ? best : null;
}

/** Normalise a spoken voice name so "Zachariah, of Earth!" == "zachariah of earth". */
export function phraseKey(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A voice name needs at least two words so it is not a single common word. */
export function isUsablePhrase(key: string): boolean {
  const words = key.split(" ").filter(Boolean);
  return words.length >= 2 && key.length >= 6 && key.length <= 80;
}
