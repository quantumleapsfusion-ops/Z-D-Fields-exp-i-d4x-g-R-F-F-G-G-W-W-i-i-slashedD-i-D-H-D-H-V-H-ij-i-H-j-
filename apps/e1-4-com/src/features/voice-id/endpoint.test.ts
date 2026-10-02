import { describe, expect, it } from "vitest";

import { endOfSpeech } from "./endpoint";

/** Feeds `level` every 16 ms from `from` to `to` and returns when the detector fired, if it did. */
function feed(
  detect: ReturnType<typeof endOfSpeech>,
  level: number,
  from: number,
  to: number,
): number | null {
  for (let t = from; t < to; t += 16) if (detect(level, t)) return t;
  return null;
}

describe("endOfSpeech", () => {
  it("ends the answer after speech followed by a pause", () => {
    const detect = endOfSpeech();
    expect(feed(detect, 0.01, 0, 300)).toBeNull();
    expect(feed(detect, 0.3, 300, 1800)).toBeNull();
    const at = feed(detect, 0.01, 1800, 4000);
    expect(at).not.toBeNull();
    expect(at! - 1800).toBeGreaterThanOrEqual(650);
    expect(at! - 1800).toBeLessThan(700);
  });

  it("does not end on silence before anyone speaks", () => {
    expect(feed(endOfSpeech(), 0.01, 0, 5000)).toBeNull();
  });

  it("does not end on a short burst like a cough", () => {
    const detect = endOfSpeech();
    feed(detect, 0.4, 0, 200);
    expect(feed(detect, 0.01, 200, 3000)).toBeNull();
  });

  it("keeps listening through a short gap between words", () => {
    const detect = endOfSpeech();
    feed(detect, 0.3, 0, 1000);
    expect(feed(detect, 0.01, 1000, 1400)).toBeNull();
    expect(feed(detect, 0.3, 1400, 2000)).toBeNull();
    expect(feed(detect, 0.01, 2000, 3000)).not.toBeNull();
  });

  it("never ends while the sound stays loud, such as a steady tone", () => {
    expect(feed(endOfSpeech(), 0.5, 0, 10_000)).toBeNull();
  });

  it("fires only once", () => {
    const detect = endOfSpeech();
    feed(detect, 0.3, 0, 1200);
    expect(feed(detect, 0.01, 1200, 3000)).not.toBeNull();
    expect(feed(detect, 0.01, 3000, 5000)).toBeNull();
  });
});
