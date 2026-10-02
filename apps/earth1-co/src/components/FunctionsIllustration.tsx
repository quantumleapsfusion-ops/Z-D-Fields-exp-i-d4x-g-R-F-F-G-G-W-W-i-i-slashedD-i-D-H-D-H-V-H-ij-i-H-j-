"use client";

import { useEffect, useRef } from "react";

/**
 * Functions: Mapping from domain to codomain
 */
export function FunctionsIllustration() {
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

      time = reduce ? 0 : (time + 0.01) % (Math.PI * 2);
      const t = time;

      // Domain on left
      const domainX = w / 4;
      const domainY = h / 2;
      const radius = 40;

      // Codomain on right
      const codomainX = (3 * w) / 4;
      const codomainY = h / 2;

      // Domain points
      ctx.fillStyle = "rgba(100, 150, 255, 0.8)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";

      const domainPoints = [-2, -1, 0, 1, 2];
      const domainPos: { x: number; y: number; val: number }[] = [];

      for (let i = 0; i < domainPoints.length; i++) {
        const y = domainY - radius + (i * (2 * radius)) / 4;
        const val = domainPoints[i];
        domainPos.push({ x: domainX, y, val });

        ctx.beginPath();
        ctx.arc(domainX, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
        ctx.fillText(val.toString(), domainX - 25, y + 4);
        ctx.fillStyle = "rgba(100, 150, 255, 0.8)";
      }

      // Codomain points and arrows
      ctx.fillStyle = "rgba(150, 100, 255, 0.8)";

      for (const { x: dx, y: dy, val: domainVal } of domainPos) {
        const codomainVal = domainVal * domainVal; // f(x) = x²
        const cy =
          codomainY -
          radius +
          ((codomainVal + 4) / 8) * (2 * radius);

        // Draw arrow from domain to codomain
        ctx.strokeStyle = "rgba(100, 200, 150, 0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(dx + 10, dy);
        ctx.lineTo(cx - 10, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw codomain point
        ctx.fillStyle = "rgba(150, 100, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(codomainX, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Codomain labels
      ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      for (let i = 0; i <= 4; i++) {
        const y = codomainY - radius + (i * (2 * radius)) / 4;
        const val = i * i;
        ctx.fillText(val.toString(), codomainX + 25, y + 4);
      }

      // Labels
      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Domain", domainX, domainY - radius - 20);
      ctx.fillText("Codomain", codomainX, codomainY - radius - 20);
      ctx.fillText("f(x) = x²", w / 2, h - 30);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-96 rounded border border-white/20"
      aria-label="Function illustration showing domain to codomain mapping"
    />
  );
}
