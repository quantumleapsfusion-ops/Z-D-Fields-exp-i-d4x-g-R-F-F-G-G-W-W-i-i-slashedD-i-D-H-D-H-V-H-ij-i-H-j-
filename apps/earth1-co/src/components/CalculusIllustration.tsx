"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive Calculus Illustration: Derivatives as Slope, Integrals as Area
 * Shows the fundamental theorem of calculus visually.
 */
export function CalculusIllustration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationId: number;
    let time = 0;

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.95)";
      ctx.fillRect(0, 0, w, h);

      // Time-based animation
      time = reduce ? 0 : (time + 0.01) % (Math.PI * 2);
      const t = time;

      // Padding
      const px = 40;
      const py = 40;
      const gw = w - 2 * px;
      const gh = h - 2 * py;

      // Grid and axes
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;

      // Horizontal axis
      ctx.beginPath();
      ctx.moveTo(px, py + gh / 2);
      ctx.lineTo(px + gw, py + gh / 2);
      ctx.stroke();

      // Vertical axis
      ctx.beginPath();
      ctx.moveTo(px + gw / 2, py);
      ctx.lineTo(px + gw / 2, py + gh);
      ctx.stroke();

      // Draw a parabola f(x) = x^2
      ctx.strokeStyle = "rgba(100, 200, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < gw; i++) {
        const nx = (i / gw) * 4 - 2; // Range from -2 to 2
        const ny = nx * nx; // f(x) = x^2

        const screenX = px + (nx + 2) * (gw / 4);
        const screenY = py + gh / 2 - ny * (gh / 8);

        if (i === 0) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();

      // Draw integral area (shaded region under curve)
      const x1 = -1 + 0.5 * Math.sin(t);
      const x2 = 1 + 0.5 * Math.sin(t);

      ctx.fillStyle = "rgba(100, 200, 255, 0.15)";
      ctx.beginPath();
      ctx.moveTo(px + (x1 + 2) * (gw / 4), py + gh / 2);

      for (let i = 0; i < (x2 - x1) * 100; i++) {
        const x = x1 + (i / 100) * (x2 - x1);
        const y = x * x;
        ctx.lineTo(px + (x + 2) * (gw / 4), py + gh / 2 - y * (gh / 8));
      }

      ctx.lineTo(px + (x2 + 2) * (gw / 4), py + gh / 2);
      ctx.closePath();
      ctx.fill();

      // Draw tangent line (derivative)
      const dx = 0.5 + 0.3 * Math.sin(t);
      const fx = dx * dx;
      const slope = 2 * dx; // f'(x) = 2x

      ctx.strokeStyle = "rgba(255, 150, 100, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      const screenXPoint = px + (dx + 2) * (gw / 4);
      const screenYPoint = py + gh / 2 - fx * (gh / 8);

      ctx.beginPath();
      ctx.moveTo(screenXPoint - 100, screenYPoint - slope * 100 * (gh / 8));
      ctx.lineTo(screenXPoint + 100, screenYPoint + slope * 100 * (gh / 8));
      ctx.stroke();

      ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "12px sans-serif";
      ctx.fillText("f(x) = x²", px + 10, py + 20);
      ctx.fillText("Derivative (slope)", px + 10, py + 40);
      ctx.fillText("Integral (area)", px + 10, py + 60);

      if (!reduce) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-96 rounded border border-white/20"
      aria-label="Calculus illustration showing derivative as tangent line slope and integral as area under curve"
    />
  );
}
