import { describe, expect, it } from "vitest";

import {
  averageEmbeddings,
  buildEmbedding,
  cosine,
  EMBEDDING_SIZE,
  frameFeatures,
  isUsablePhrase,
  isValidEmbedding,
  matchVoicePrint,
  mergeEmbedding,
  phraseKey,
  type Frame,
} from "./voiceprint";

const SAMPLE_RATE = 48000;
const BINS = 1024;

/** Synthetic "voice": harmonic stack at `f0` with a spectral tilt, plus noise. */
function spectrum(f0: number, tilt: number, seed: number): Float32Array {
  const out = new Float32Array(BINS);
  const hzPerBin = SAMPLE_RATE / 2 / BINS;
  let s = seed;
  const rand = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
  for (let i = 0; i < BINS; i++) {
    const hz = i * hzPerBin;
    let db = -70 + tilt * Math.log2(Math.max(hz, 40) / 100) + rand() * 3;
    const harmonic = Math.round(hz / f0);
    if (harmonic > 0 && Math.abs(hz - harmonic * f0) < hzPerBin) db += 35;
    out[i] = db;
  }
  return out;
}

function utterance(f0: number, tilt: number, seed: number, frames = 40): Frame[] {
  const out: Frame[] = [];
  for (let k = 0; k < frames; k++) {
    const f = frameFeatures(
      spectrum(f0 * (1 + 0.02 * Math.sin(k)), tilt, seed + k),
      SAMPLE_RATE,
    );
    if (f) out.push(f);
  }
  return out;
}

describe("frameFeatures", () => {
  it("drops silent frames", () => {
    expect(frameFeatures(new Float32Array(BINS).fill(-120), SAMPLE_RATE)).toBeNull();
  });
  it("tracks the spectral centroid", () => {
    const low = frameFeatures(spectrum(110, -8, 1), SAMPLE_RATE)!;
    const high = frameFeatures(spectrum(240, -2, 1), SAMPLE_RATE)!;
    expect(high.centroid).toBeGreaterThan(low.centroid);
  });
});

describe("buildEmbedding / matching", () => {
  const alice = buildEmbedding(utterance(210, -3, 7));
  const aliceAgain = buildEmbedding(utterance(210, -3, 99));
  const bob = buildEmbedding(utterance(105, -9, 13));

  it("produces a valid unit vector of the documented size", () => {
    expect(alice).toHaveLength(EMBEDDING_SIZE);
    expect(isValidEmbedding(alice)).toBe(true);
  });

  it("matches the same voice and rejects a different one", () => {
    expect(cosine(alice, aliceAgain)).toBeGreaterThan(cosine(alice, bob));
    const hit = matchVoicePrint(aliceAgain, [
      { id: "bob", embedding: bob },
      { id: "alice", embedding: alice },
    ]);
    expect(hit?.id).toBe("alice");
    expect(matchVoicePrint(bob, [{ id: "alice", embedding: alice }])).toBeNull();
  });

  it("keeps merged and averaged prints normalised", () => {
    const merged = mergeEmbedding(alice, 3, aliceAgain);
    const averaged = averageEmbeddings([alice, aliceAgain]);
    expect(isValidEmbedding(merged)).toBe(true);
    expect(isValidEmbedding(averaged)).toBe(true);
    expect(cosine(merged, alice)).toBeGreaterThan(0.95);
  });

  it("rejects malformed client vectors", () => {
    expect(isValidEmbedding([1, 0, 0])).toBe(false);
    expect(isValidEmbedding(alice.map((x) => x * 2))).toBe(false);
    expect(isValidEmbedding([...alice.slice(0, -1), Number.NaN])).toBe(false);
  });
});

describe("phraseKey", () => {
  it("normalises punctuation, case and accents", () => {
    expect(phraseKey("  Zachariah, of Earth! ")).toBe("zachariah of earth");
    expect(phraseKey("Zoë Δ Ríos")).toBe("zoe rios");
  });
  it("requires at least two words", () => {
    expect(isUsablePhrase(phraseKey("earthling"))).toBe(false);
    expect(isUsablePhrase(phraseKey("greetings earthling"))).toBe(true);
  });
});
