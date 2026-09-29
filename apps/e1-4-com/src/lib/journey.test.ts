import { describe, expect, it } from "vitest";

import { STAGES, WORD_MS, nextStage, stageDuration } from "@/lib/journey";

describe("journey", () => {
  it("climbs the dimensions in order without skipping back", () => {
    const dims = STAGES.map((stage) => stage.dimension ?? 0);
    expect(dims).toEqual([...dims].sort((a, b) => a - b));
    expect(STAGES[0].id).toBe("voice");
    expect(STAGES.at(-1)?.id).toBe("observed");
  });

  it("advances one stage at a time and stops at the end", () => {
    expect(nextStage(0)).toBe(1);
    expect(nextStage(STAGES.length - 1)).toBe(STAGES.length - 1);
  });

  it("gives every stage but the last a timer", () => {
    for (const stage of STAGES.slice(0, -1)) {
      expect(stageDuration(stage.id, 10)).toBeGreaterThan(0);
    }
    expect(stageDuration("observed", 10)).toBeNull();
  });

  it("lets speech-to-text run as long as the words need, within bounds", () => {
    expect(stageDuration("text", 1)).toBe(4000);
    expect(stageDuration("text", 50)).toBe(50 * WORD_MS + 1500);
    expect(stageDuration("text", 10000)).toBe(12000);
  });
});
