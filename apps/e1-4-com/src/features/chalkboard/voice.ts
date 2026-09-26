import type { BoardElement } from "@/lib/chalkboard/types";

import type { Point } from "./Board2D";

export type VoiceAction =
  | { kind: "shape"; shape: "ellipse" | "rect" | "line" | "arrow" }
  | { kind: "undo" }
  | { kind: "text"; text: string };

const SHAPES: Record<string, "ellipse" | "rect" | "line" | "arrow"> = {
  circle: "ellipse",
  ellipse: "ellipse",
  oval: "ellipse",
  box: "rect",
  square: "rect",
  rectangle: "rect",
  line: "line",
  arrow: "arrow",
};

/** Tiny voice grammar: "draw a circle", "add an arrow", "undo" — anything else is placed as text. */
export function parseVoice(text: string): VoiceAction {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/, "");
  if (/^(undo|scratch that)$/.test(t)) return { kind: "undo" };
  const m = t.match(
    /^(?:draw|add|make)\s+(?:a|an|another)?\s*(circle|ellipse|oval|box|square|rectangle|line|arrow)$/,
  );
  if (m) return { kind: "shape", shape: SHAPES[m[1]] };
  return { kind: "text", text: text.trim() };
}

export function shapeAt(
  shape: "ellipse" | "rect" | "line" | "arrow",
  at: Point,
  scale: number,
  color: string,
): BoardElement {
  const s = 80 / scale;
  const base = { id: crypto.randomUUID(), color, createdAt: Date.now() };
  const stroke = 3 / scale;
  switch (shape) {
    case "ellipse":
      return {
        ...base,
        type: "ellipse",
        x: at.x + s,
        y: at.y + s / 2,
        radiusX: s,
        radiusY: s / 2,
        strokeWidth: stroke,
      };
    case "rect":
      return {
        ...base,
        type: "rect",
        x: at.x,
        y: at.y,
        width: s * 2,
        height: s,
        strokeWidth: stroke,
      };
    default:
      return {
        ...base,
        type: "line",
        points: [at.x, at.y + s / 2, at.x + s * 2, at.y + s / 2],
        width: stroke,
        arrow: shape === "arrow",
      };
  }
}
