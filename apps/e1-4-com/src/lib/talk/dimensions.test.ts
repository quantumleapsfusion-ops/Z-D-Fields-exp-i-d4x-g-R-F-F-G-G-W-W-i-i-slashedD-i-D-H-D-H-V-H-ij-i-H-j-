import { describe, expect, it } from "vitest";

import { STAGES } from "@/lib/journey";

import { DIMENSIONS, inTalk, MIN_STAGE_MS, talkSource, talkStageAt } from "./dimensions";

const id = "0b6f3a9e-4c1d-4e8a-9b2f-1a2b3c4d5e6f";

describe("talk dimensions", () => {
  it("lists 1D to 5D in order", () => {
    expect(DIMENSIONS.map((x) => x.d)).toEqual([1, 2, 3, 4, 5]);
  });

  it("reads a conversation id from the query and ignores anything else", () => {
    expect(talkSource(`?talk=${id}`)).toBe(id);
    expect(talkSource(new URLSearchParams({ talk: id }))).toBe(id);
    expect(talkSource("?talk=../../etc")).toBeNull();
    expect(talkSource("")).toBeNull();
  });

  it("links a dimension to the conversation", () => {
    expect(inTalk("/horizon", id)).toBe(`/horizon?talk=${id}`);
    expect(inTalk("/horizon", null)).toBe("/horizon");
  });
});

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
