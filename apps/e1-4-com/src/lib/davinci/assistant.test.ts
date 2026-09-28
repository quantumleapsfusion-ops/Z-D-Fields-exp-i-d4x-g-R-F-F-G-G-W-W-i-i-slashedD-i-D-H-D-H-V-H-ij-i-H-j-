import { describe, expect, it } from "vitest";

import { evaluate, interpret } from "./assistant";

describe("evaluate", () => {
  it("handles precedence, parentheses, powers and unary signs", () => {
    expect(evaluate("2 + 3 * 4")).toBe("14");
    expect(evaluate("(2 + 3) * 4")).toBe("20");
    expect(evaluate("2 ^ 3 ^ 2")).toBe("512");
    expect(evaluate("-(4 - 6) * 3")).toBe("6");
    expect(evaluate("10 / 4")).toBe("2.5");
  });

  it("returns null for garbage", () => {
    expect(evaluate("2 +")).toBeNull();
    expect(evaluate("hello")).toBeNull();
    expect(evaluate("(1 + 2")).toBeNull();
  });
});

describe("interpret", () => {
  it("routes navigation requests", () => {
    const action = interpret("take me to the chalkboard", null);
    expect(action.kind).toBe("navigate");
    if (action.kind === "navigate") expect(action.href).toBe("/chalkboard");
  });

  it("solves arithmetic", () => {
    const action = interpret("what is 6 * 7", null);
    expect(action.kind).toBe("math");
    if (action.kind === "math") expect(action.result).toBe("42");
  });

  it("summarises the active playlist", () => {
    const action = interpret("summarize this stream", {
      key: "k",
      title: "Field notes",
      segments: [
        {
          id: "1",
          durationMs: 1000,
          transcript: "The river rose overnight. We moved camp.",
        },
        { id: "2", durationMs: 1000, transcript: "Morning was clear." },
      ],
      audioUrl: (id) => `/a/${id}`,
    });
    expect(action.kind).toBe("synthesis");
    if (action.kind === "synthesis") {
      expect(action.title).toBe("Field notes");
      expect(action.segments).toBe(2);
      expect(action.summary.length).toBeGreaterThan(0);
    }
  });
});
