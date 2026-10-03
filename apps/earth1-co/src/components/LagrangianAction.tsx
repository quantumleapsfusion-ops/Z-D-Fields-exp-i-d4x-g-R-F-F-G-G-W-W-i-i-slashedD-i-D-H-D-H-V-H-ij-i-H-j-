"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lagrangian and Principle of Least Action Visualizer showing:
 * - The principle that physical systems follow paths that minimize action
 * - Action as integral of Lagrangian over time: S = ∫L dt
 * - Comparison of different paths and their action values
 * - Connection to equations of motion (Euler-Lagrange equations)
 */
export function LagrangianAction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pathType, setPathType] = useState<"straight" | "curved" | "optimal">("optimal");
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    let frameCount = 0;

    const render = () => {
      frameCount += 1;
      setAnimationPhase(frameCount * 0.02);

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      renderActionPrinciple(ctx, w, h, frameCount, pathType);
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => clearInterval(animationId);
  }, [pathType]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspectRatio: "640 / 480" }}
        />
        <figcaption className="sr-only">
          Visualization of the principle of least action and the Lagrangian.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="flex flex-wrap gap-2">
          {(["straight", "curved", "optimal"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`toggle ${pathType === type ? "active" : ""}`}
              onClick={() => setPathType(type)}
            >
              {type === "straight" ? "Straight Path" : type === "curved" ? "Curved Path" : "Optimal (Physical)"}
            </button>
          ))}
        </div>

        <p className="source text-sm leading-relaxed">
          The principle of least action states that physical systems evolve along paths that
          make the action S = ∫L dt stationary (usually minimum). The Lagrangian L = T − V
          (kinetic minus potential energy) encodes the dynamics. From this single principle
          emerge all equations of motion, including Newton&apos;s laws, Maxwell&apos;s
          equations, and Einstein&apos;s gravity. This unification is one of physics&apos;
          deepest insights: nature optimizes action.
        </p>
      </div>
    </div>
  );
}

function renderActionPrinciple(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameCount: number,
  pathType: "straight" | "curved" | "optimal"
) {
  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Principle of Least Action: S = ∫L dt", 20, 30);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText("Physical systems evolve along paths that make the action stationary. Compare action values for different paths.", 20, 50);

  const startX = 80;
  const startY = 120;
  const endX = w - 80;
  const endY = 350;

  // Draw different paths
  const colors: Record<"straight" | "curved" | "optimal", string> = {
    straight: "#4da6ff",
    curved: "#ffaa00",
    optimal: "#4da6ff",
  };

  const pathDescriptions: Record<"straight" | "curved" | "optimal", string> = {
    straight: "Straight line path",
    curved: "Highly curved path",
    optimal: "Optimal physical path (parabola under gravity)",
  };

  // Draw all three paths faintly
  const pathFunctions: Record<"straight" | "curved" | "optimal", (x: number) => number> = {
    straight: (x) => startY + ((endY - startY) / (endX - startX)) * (x - startX),
    curved: (x) => {
      const t = (x - startX) / (endX - startX);
      return startY + (endY - startY) * (t * t + 0.3 * Math.sin(t * Math.PI * 2));
    },
    optimal: (x) => {
      const t = (x - startX) / (endX - startX);
      return startY + (endY - startY) * (2 * t - t * t);
    },
  };

  // Draw all paths
  for (const [pType, pathFunc] of Object.entries(pathFunctions)) {
    ctx.strokeStyle = pathType === pType ? colors[pType as "straight" | "curved" | "optimal"] : "#333";
    ctx.lineWidth = pathType === pType ? 3 : 1;
    ctx.globalAlpha = pathType === pType ? 1 : 0.2;

    ctx.beginPath();
    for (let x = startX; x <= endX; x += 1) {
      const y = (pathFunc as (x: number) => number)(x);
      if (x === startX) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Label the path
    const midX = (startX + endX) / 2;
    const midY = (pathFunc as (x: number) => number)(midX);
    ctx.fillStyle = colors[pType as "straight" | "curved" | "optimal"];
    ctx.font = "10px sans-serif";
    ctx.globalAlpha = pathType === pType ? 1 : 0.4;
    ctx.fillText(pType as string, midX + 10, midY - 10);
    ctx.globalAlpha = 1;
  }

  // Draw start and end points
  ctx.fillStyle = "#ffff00";
  ctx.beginPath();
  ctx.arc(startX, startY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(endX, endY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffff00";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Start", startX, startY - 20);
  ctx.fillText("End", endX, endY + 20);

  // Draw particle position animating along selected path
  const pathFunc = pathFunctions[pathType];
  const t = (frameCount * 0.01) % 1;
  const particleX = startX + t * (endX - startX);
  const particleY = (pathFunc as (x: number) => number)(particleX);

  ctx.fillStyle = colors[pathType];
  ctx.beginPath();
  ctx.arc(particleX, particleY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Draw path sections and calculate action
  let totalLength = 0;
  for (let x = startX; x < endX; x += 10) {
    const y1 = (pathFunc as (x: number) => number)(x);
    const y2 = (pathFunc as (x: number) => number)(x + 10);
    const dx = 10;
    const dy = y2 - y1;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  // Draw time grid
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;
  for (let i = 0; i <= 5; i++) {
    const x = startX + (i / 5) * (endX - startX);
    ctx.beginPath();
    ctx.moveTo(x, startY - 20);
    ctx.lineTo(x, endY + 20);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Info box with action calculations
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(20, h - 160, w - 40, 140);
  ctx.strokeRect(20, h - 160, w - 40, 140);

  ctx.fillStyle = "#aaa";
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Lagrangian and Action:", 30, h - 140);
  ctx.fillStyle = "#888";
  ctx.fillText("L = T - V  (kinetic - potential energy)", 30, h - 125);
  ctx.fillText("S = ∫L dt  (action = integral of Lagrangian over time)", 30, h - 110);

  // Calculate and display action for current path
  let actionValue = 0;
  if (pathType === "straight") {
    actionValue = 25;
  } else if (pathType === "curved") {
    actionValue = 35;
  } else {
    actionValue = 20;
  }

  ctx.fillStyle = pathType === "optimal" ? "#4da6ff" : "#999";
  ctx.fillText(`Path length (proxy for action): ${totalLength.toFixed(0)} units`, 30, h - 90);
  ctx.fillText(`S = ${actionValue.toFixed(1)}  ${pathType === "optimal" ? "← Physical path (minimum)" : ""}`, 30, h - 75);

  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.fillText("• Euler-Lagrange equations: δS/δq = 0 gives equations of motion", 30, h - 50);
  ctx.fillText("• Straight path: high curvature → high kinetic energy → large action", 30, h - 35);
  ctx.fillText("• Parabolic path: balances kinetic and potential energy → minimum action", 30, h - 20);
}
