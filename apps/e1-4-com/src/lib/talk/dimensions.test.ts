import { describe, expect, it } from "vitest";

import { STAGES } from "@/lib/journey";

import { MIN_STAGE_MS, talkStageAt } from "./dimensions";

const order = STAGES.map((stage) => stage.id);

describe("talkStageAt", () => {
  it("starts in the voice line and ends observed", () => {
    expect(talkStageAt(0, 20_000)).toBe("voice");
    expect(talkStageAt(20_000, 20_000)).toBe("observed");
    expect(talkStageAt(60_000, 20_000)).toBe("observed");
  });

  it("climbs every dimension in order without skipping back", () => {
    const seen: string[] = [];
    for (let t = 0; t <= 20_000; t += 50) {
      const stage = talkStageAt(t, 20_000);
      if (seen.at(-1) !== stage) seen.push(stage);
    }
    expect(seen).toEqual(order);
  });

  it("gives short notes a minimum time in each dimension", () => {
    expect(talkStageAt(MIN_STAGE_MS * 0.5, 500)).toBe("voice");
    expect(talkStageAt(MIN_STAGE_MS * 5 - 1, 500)).toBe("superposition");
    expect(talkStageAt(MIN_STAGE_MS * 5, 500)).toBe("observed");
  });
});
