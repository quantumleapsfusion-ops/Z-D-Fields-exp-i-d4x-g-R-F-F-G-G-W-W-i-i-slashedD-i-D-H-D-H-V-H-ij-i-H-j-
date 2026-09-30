import { describe, expect, it } from "vitest";

import { DIMENSIONS, inTalk, talkSource } from "./dimensions";

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
