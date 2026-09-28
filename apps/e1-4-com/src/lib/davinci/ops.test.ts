import { describe, expect, it } from "vitest";

import { CANVAS, type DrawOp, drawOpSchema, stubDraw } from "./ops";

const SLACK = 120;

function nearCanvas(op: DrawOp): boolean {
  const ok = (n: number, max: number) => n >= -SLACK && n <= max + SLACK;
  if ("points" in op) {
    return op.points.every((n, i) => ok(n, i % 2 === 0 ? CANVAS.width : CANVAS.height));
  }
  return ok(op.x, CANVAS.width) && ok(op.y, CANVAS.height);
}

describe("stubDraw", () => {
  it("returns a valid, non-empty sketch for a known motif", () => {
    const res = stubDraw("Look at the sun", []);
    expect(res.source).toBe("stub");
    expect(res.caption).toBe("Sketching: sun");
    expect(res.ops.length).toBeGreaterThan(0);
    for (const op of res.ops) expect(drawOpSchema.safeParse(op).success).toBe(true);
  });

  it("resolves synonyms and de-duplicates motifs", () => {
    const res = stubDraw("sunrise, sunset, sunshine", []);
    expect(res.caption).toBe("Sketching: sun");
    expect(res.ops).toEqual(stubDraw("sun", []).ops);
  });

  it("is deterministic for the same text and board size", () => {
    expect(stubDraw("a tree by the sun", [])).toEqual(stubDraw("a tree by the sun", []));
  });

  it("places motifs differently as the board fills up", () => {
    const empty = stubDraw("sun", []);
    const later = stubDraw("sun", empty.ops);
    expect(later.ops).not.toEqual(empty.ops);
  });

  it("pins the longest keyword when nothing matches", () => {
    const res = stubDraw("quantum entanglement is odd", []);
    expect(res.caption).toBe("Listening…");
    expect(res.ops).toHaveLength(1);
    const [op] = res.ops;
    expect(op.kind).toBe("text");
    if (op.kind === "text") expect(op.text).toBe("entanglement");
  });

  it("draws nothing for silence or very short words", () => {
    expect(stubDraw("", []).ops).toEqual([]);
    expect(stubDraw("um ok so", []).ops).toEqual([]);
  });

  it("keeps every op on or near the virtual canvas", () => {
    const text = "sun star tree house mountain river cloud heart arrow";
    let existing: DrawOp[] = [];
    for (let i = 0; i < 5; i++) {
      const res = stubDraw(text, existing);
      for (const op of res.ops) expect(nearCanvas(op)).toBe(true);
      existing = [...existing, ...res.ops];
    }
  });
});
