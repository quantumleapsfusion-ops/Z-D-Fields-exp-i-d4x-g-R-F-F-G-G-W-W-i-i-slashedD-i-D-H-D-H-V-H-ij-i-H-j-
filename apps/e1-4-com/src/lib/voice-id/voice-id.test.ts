import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import { CHALLENGE_WORDS, makePhrase, phraseMatches } from "./challenge";
import { aggregateScores, bestMatch } from "./match";
import {
  concatPcm,
  floatToInt16,
  frames,
  int16FromBytes,
  int16ToBytes,
  wavFromPcm,
} from "./pcm";
import { openProfile, parseProfileKey, sealProfile } from "./seal";

describe("challenge phrases", () => {
  it("draws distinct words from the list", () => {
    for (let i = 0; i < 50; i += 1) {
      const words = makePhrase().split(" ");
      expect(words).toHaveLength(4);
      expect(new Set(words).size).toBe(4);
      words.forEach((w) => expect(CHALLENGE_WORDS).toContain(w));
    }
  });

  it("accepts the phrase with filler, punctuation, reordering and one slip", () => {
    expect(phraseMatches("amber comet river tulip", "Amber, comet... river tulip.")).toBe(
      true,
    );
    expect(phraseMatches("amber comet river tulip", "um tulip river comet amber")).toBe(
      true,
    );
    expect(phraseMatches("sparrow comet river tulip", "sparow comet river tulip")).toBe(
      true,
    );
  });

  it("rejects a missing or different word", () => {
    expect(phraseMatches("amber comet river tulip", "amber comet river")).toBe(false);
    expect(phraseMatches("amber comet river tulip", "amber comet river willow")).toBe(
      false,
    );
    expect(phraseMatches("amber comet river tulip", "")).toBe(false);
  });
});

describe("pcm", () => {
  it("round-trips samples through little-endian bytes", () => {
    const pcm = Int16Array.from([0, 1, -1, 32767, -32768]);
    expect(Array.from(int16FromBytes(int16ToBytes(pcm)))).toEqual(Array.from(pcm));
    expect(() => int16FromBytes(new Uint8Array(3))).toThrow();
  });

  it("clamps floats to 16-bit range", () => {
    expect(Array.from(floatToInt16(Float32Array.from([0, 1, -1, 2, -2])))).toEqual([
      0, 32767, -32768, 32767, -32768,
    ]);
  });

  it("splits full frames and concatenates parts", () => {
    const pcm = Int16Array.from({ length: 10 }, (_, i) => i);
    expect(frames(pcm, 4).map((f) => Array.from(f))).toEqual([
      [0, 1, 2, 3],
      [4, 5, 6, 7],
    ]);
    expect(Array.from(concatPcm([pcm.subarray(0, 2), pcm.subarray(8)]))).toEqual([
      0, 1, 8, 9,
    ]);
  });

  it("writes a valid 16 kHz mono WAV header", () => {
    const wav = wavFromPcm(Int16Array.from([1, 2, 3]));
    const view = new DataView(wav.buffer);
    expect(new TextDecoder().decode(wav.subarray(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(wav.subarray(8, 12))).toBe("WAVE");
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint32(40, true)).toBe(6);
    expect(wav.byteLength).toBe(50);
  });
});

describe("voiceprint sealing", () => {
  const key = randomBytes(32);

  it("round-trips and never stores the profile in the clear", () => {
    const profile = randomBytes(256);
    const sealed = sealProfile(profile, key);
    expect(Buffer.from(sealed).includes(profile.subarray(0, 32))).toBe(false);
    expect(Buffer.from(openProfile(sealed, key)).equals(profile)).toBe(true);
  });

  it("rejects tampering and the wrong key", () => {
    const sealed = sealProfile(randomBytes(64), key);
    const tampered = Uint8Array.from(sealed);
    tampered[tampered.length - 1] ^= 1;
    expect(() => openProfile(tampered, key)).toThrow();
    expect(() => openProfile(sealed, randomBytes(32))).toThrow();
  });

  it("requires a 32-byte key", () => {
    expect(parseProfileKey(randomBytes(32).toString("base64"))).toHaveLength(32);
    expect(() => parseProfileKey(randomBytes(16).toString("base64"))).toThrow();
  });
});

describe("speaker matching", () => {
  it("averages each profile's best half of chunks", () => {
    const chunks = [
      [0.9, 0.2],
      [0.1, 0.3],
      [0.8, 0.1],
      [0.0, 0.2],
    ];
    const [a, b] = aggregateScores(chunks, 2);
    expect(a).toBeCloseTo(0.85);
    expect(b).toBeCloseTo(0.25);
    expect(aggregateScores([], 2)).toEqual([0, 0]);
  });

  it("returns the single clear winner above the threshold", () => {
    expect(bestMatch(["a", "b"], [0.4, 0.9], 0.75)).toEqual({ userId: "b", score: 0.9 });
  });

  it("refuses weak or ambiguous matches", () => {
    expect(bestMatch(["a"], [0.6], 0.75)).toBeNull();
    expect(bestMatch(["a", "b"], [0.86, 0.8], 0.75)).toBeNull();
    expect(bestMatch([], [], 0.75)).toBeNull();
  });
});
