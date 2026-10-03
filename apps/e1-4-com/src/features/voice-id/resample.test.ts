import { describe, expect, it } from "vitest";

import { MAX_PCM_SECONDS, toPcm16 } from "./resample";

describe("toPcm16", () => {
  it("returns nothing for an empty recording", () => {
    expect(toPcm16([], 48000)).toBeNull();
    expect(toPcm16([new Float32Array(0)], 48000)).toBeNull();
  });

  it("resamples 48 kHz to 16 kHz, joining chunks", () => {
    const chunk = new Float32Array(4800).fill(0.5);
    const pcm = toPcm16([chunk, chunk], 48000)!;
    expect(pcm.byteLength / 2).toBe(3200);
    expect(new DataView(pcm).getInt16(0, true)).toBe(Math.round(0.5 * 32767));
  });

  it("clips to full scale and caps the length", () => {
    const loud = new Float32Array(16000 * (MAX_PCM_SECONDS + 5)).fill(3);
    const pcm = toPcm16([loud], 16000)!;
    expect(pcm.byteLength / 2).toBe(16000 * MAX_PCM_SECONDS);
    expect(new DataView(pcm).getInt16(0, true)).toBe(32767);
  });
});
