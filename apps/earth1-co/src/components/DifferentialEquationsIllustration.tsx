"use client";

import { useEffect, useRef } from "react";

/**
 * Slope fields and solutions for differential equations
 */
export function DifferentialEquationsIllustration() {
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

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.95)";
      ctx.fillRect(0, 0, w, h);

      const px = 40;
      const py = 40;
      const gw = w - 2 * px;
      const gh = h - 2 * py;

      // Draw grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(px + (i / 10) * gw, py);
        ctx.lineTo(px + (i / 10) * gw, py + gh);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(px, py + (i / 10) * gh);
        ctx.lineTo(px + gw, py + (i / 10) * gh);
        ctx.stroke();
      }

      // Draw slope field for dy/dx = y (exponential)
      const step = 30;
      ctx.strokeStyle = "rgba(100, 200, 150, 0.6)";
      ctx.lineWidth = 1.5;

      for (let x = 0; x < gw; x += step) {
        for (let y = 0; y < gh; y += step) {
          // Convert to normalized coordinates
          const nx = (x / gw) * 4 - 2;
          const ny = 1 - (y / gh) * 2;

          // dy/dx = y
          const slope = ny;
          const length = 8;

          const dx = length / Math.sqrt(1 + slope * slope);
          const dy = (slope * dx);

          ctx.beginPath();
          ctx.moveTo(px + x - dx / 2, py + y - dy / 2);
          ctx.lineTo(px + x + dx / 2, py + y + dy / 2);
          ctx.stroke();
        }
      }

      // Draw a solution curve
      ctx.strokeStyle = "rgba(255, 150, 100, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = -2; x < 2; x += 0.05) {
        const y = Math.exp(x);
        if (y > 1000) break; // Avoid too large values

        const screenX = px + ((x + 2) / 4) * gw;
        const screenY = py + (1 - y / 2) * gh;

        if (x === -2) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();

      // Labels
      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "12px sans-serif";
      ctx.fillText("dy/dx = y", px + 10, py + 20);
      ctx.fillText("Solution: y = e^x", px + 10, py + 40);
    };

    draw();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-96 rounded border border-white/20"
      aria-label="Slope field and solution to dy/dx = y"
    />
  );
}
