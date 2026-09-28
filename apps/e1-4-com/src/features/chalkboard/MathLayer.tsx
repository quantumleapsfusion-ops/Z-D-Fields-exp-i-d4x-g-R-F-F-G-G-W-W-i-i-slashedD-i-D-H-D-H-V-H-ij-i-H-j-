"use client";

import katex from "katex";
import { useMemo, useRef } from "react";
import "katex/dist/katex.min.css";

import type { BoardElement } from "@/lib/chalkboard/types";

import type { Point, Tool, Viewport } from "./Board2D";

type MathElement = Extract<BoardElement, { type: "math" }>;

type Props = {
  elements: BoardElement[];
  viewport: Viewport;
  tool: Tool;
  onMove: (id: string, world: Point) => void;
  onErase: (id: string) => void;
  onEdit: (el: MathElement) => void;
};

export function renderTex(tex: string): { html: string; error: boolean } {
  try {
    return {
      html: katex.renderToString(tex, {
        throwOnError: true,
        displayMode: true,
        output: "html",
      }),
      error: false,
    };
  } catch {
    return { html: "", error: true };
  }
}

/**
 * HTML overlay for KaTeX nodes. Konva cannot lay out MathML/HTML, so math elements live in a
 * DOM layer positioned with the same world -> screen transform as the stage.
 */
export function MathLayer({ elements, viewport, tool, onMove, onErase, onEdit }: Props) {
  const math = useMemo(
    () => elements.filter((el): el is MathElement => el.type === "math"),
    [elements],
  );
  const interactive = tool === "select" || tool === "eraser";

  return (
    <div
      aria-hidden={!interactive}
      className="absolute inset-0"
      style={{ pointerEvents: "none", overflow: "hidden" }}
    >
      {math.map((el) => (
        <MathNode
          key={el.id}
          el={el}
          viewport={viewport}
          tool={tool}
          interactive={interactive}
          onMove={onMove}
          onErase={onErase}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

function MathNode({
  el,
  viewport,
  tool,
  interactive,
  onMove,
  onErase,
  onEdit,
}: {
  el: MathElement;
  viewport: Viewport;
  tool: Tool;
  interactive: boolean;
} & Pick<Props, "onMove" | "onErase" | "onEdit">) {
  const drag = useRef<{ start: Point; origin: Point } | null>(null);
  const rendered = useMemo(() => renderTex(el.tex), [el.tex]);

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-label={`Math: ${el.tex}`}
      className={`absolute origin-top-left rounded px-1 select-none ${
        interactive ? "hover:bg-chalk/6" : ""
      } ${tool === "eraser" ? "cursor-cell" : tool === "select" ? "cursor-move" : ""}`}
      style={{
        left: el.x * viewport.scale + viewport.x,
        top: el.y * viewport.scale + viewport.y,
        transform: `scale(${viewport.scale})`,
        fontSize: el.fontSize,
        color: el.color,
        textShadow: `0 0 3px ${el.color}55`,
        pointerEvents: interactive ? "auto" : "none",
      }}
      onPointerDown={(e) => {
        if (tool === "eraser") {
          onErase(el.id);
          return;
        }
        if (tool !== "select") return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = {
          start: { x: e.clientX, y: e.clientY },
          origin: { x: el.x, y: el.y },
        };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        onMove(el.id, {
          x: d.origin.x + (e.clientX - d.start.x) / viewport.scale,
          y: d.origin.y + (e.clientY - d.start.y) / viewport.scale,
        });
      }}
      onPointerUp={(e) => {
        drag.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onDoubleClick={() => tool === "select" && onEdit(el)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEdit(el);
        if (e.key === "Delete" || e.key === "Backspace") onErase(el.id);
      }}
    >
      {rendered.error ? (
        <code className="text-ochre font-mono text-[0.6em]">{el.tex}</code>
      ) : (
        <span dangerouslySetInnerHTML={{ __html: rendered.html }} />
      )}
    </div>
  );
}
