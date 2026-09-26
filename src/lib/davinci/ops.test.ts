import { describe, expect, it } from "vitest";

import { CANVAS, drawResponseSchema, stubDraw, summarizeOps } from "./ops";

describe("drawResponseSchema", () => {
  it("applies defaults and accepts every op kind", () => {
    const parsed = drawResponseSchema.parse({
      ops: [
        { kind: "circle", x: 1, y: 2, r: 3 },
        { kind: "rect", x: 1, y: 2, w: 3, h: 4 },
        { kind: "line", points: [0, 0, 10, 10] },
        { kind: "path", points: [0, 0, 10, 10, 20, 0], closed: true },
        { kind: "text", x: 1, y: 2, text: "hi" },
      ],
    });
    expect(parsed.caption).toBe("");
    expect(parsed.ops[0]).toMatchObject({ color: "#f1ede1", animate: "draw" });
    expect(parsed.ops[2]).toMatchObject({ width: 3 });
    expect(parsed.ops[4]).toMatchObject({ size: 28 });
  });

  it("rejects unknown kinds, oversized op lists and non-finite coords", () => {
    expect(() => drawResponseSchema.parse({ ops: [{ kind: "blob" }] })).toThrow();
    expect(() =>
      drawResponseSchema.parse({
        ops: Array.from({ length: 25 }, () => ({ kind: "circle", x: 0, y: 0, r: 1 })),
      }),
    ).toThrow();
    expect(() =>
      drawResponseSchema.parse({ ops: [{ kind: "circle", x: Infinity, y: 0, r: 1 }] }),
    ).toThrow();
  });
});

describe("summarizeOps", () => {
  it("describes an empty canvas", () => {
    expect(summarizeOps([])).toBe("Canvas is empty.");
  });

  it("counts kinds and lists text labels", () => {
    const summary = summarizeOps([
      { kind: "circle", x: 0, y: 0, r: 1, color: "#fff", animate: "draw" },
      { kind: "text", x: 0, y: 0, text: "sun", color: "#fff", size: 20, animate: "draw" },
    ]);
    expect(summary).toContain("2 ops");
    expect(summary).toContain("1 circle");
    expect(summary).toContain("Labels: sun");
  });
});

describe("stubDraw", () => {
  it("is marked as a stub and draws recognised motifs inside the canvas", () => {
    const res = stubDraw("a bright sun over the sea", []);
    expect(res.source).toBe("stub");
    expect(res.caption).toMatch(/^Sketching:/);
    expect(res.ops.length).toBeGreaterThan(0);
    for (const op of res.ops) {
      if ("x" in op) {
        expect(op.x).toBeGreaterThanOrEqual(0);
        expect(op.x).toBeLessThanOrEqual(CANVAS.width);
        expect(op.y).toBeGreaterThanOrEqual(0);
        expect(op.y).toBeLessThanOrEqual(CANVAS.height);
      }
    }
    expect(drawResponseSchema.parse(res)).toBeTruthy();
  });

  it("falls back to pinning the longest keyword when nothing matches", () => {
    const res = stubDraw("quintessential", []);
    expect(res.ops).toHaveLength(1);
    expect(res.ops[0]).toMatchObject({ kind: "text", text: "quintessential" });
  });

  it("is deterministic for the same input and canvas state", () => {
    expect(stubDraw("moon", [])).toEqual(stubDraw("moon", []));
  });
});
