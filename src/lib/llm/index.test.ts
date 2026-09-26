import { describe, expect, it } from "vitest";

import { extractJson } from "./index";

describe("extractJson", () => {
  it("parses a bare JSON object", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses JSON wrapped in a code fence with surrounding prose", () => {
    const reply =
      'Sure! Here you go:\n```json\n{"candidates":[{"title":"x"}]}\n```\nDone.';
    expect(extractJson(reply)).toEqual({ candidates: [{ title: "x" }] });
  });

  it("parses a top-level array embedded in prose", () => {
    expect(extractJson("ops: [1, 2, 3] trailing")).toEqual([1, 2, 3]);
  });

  it("throws when no JSON is present", () => {
    expect(() => extractJson("no json here")).toThrow(/No JSON/);
  });
});
