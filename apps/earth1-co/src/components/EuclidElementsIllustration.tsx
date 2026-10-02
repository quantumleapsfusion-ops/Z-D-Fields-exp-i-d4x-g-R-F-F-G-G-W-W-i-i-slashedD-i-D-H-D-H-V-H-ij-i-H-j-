"use client";

import { useEffect, useRef } from "react";

/**
 * Euclid's Elements: Geometric constructions and proofs
 * Example: Constructing an equilateral triangle
 */
export function EuclidElementsIllustration() {
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

      time = reduce ? 0 : (time + 0.005) % 1;
      const progress = time;

      const cx = w / 2;
      const cy = h / 2;
      const size = 80;

      // Base line AB (always visible)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - size, cy + size / 2);
      ctx.lineTo(cx + size, cy + size / 2);
      ctx.stroke();

      // Point A
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(cx - size, cy + size / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Point B
      ctx.beginPath();
      ctx.arc(cx + size, cy + size / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Circle centered at A (appears at ~25% animation)
      const circle1Visible = progress > 0.15;
      if (circle1Visible) {
        ctx.strokeStyle = "rgba(100, 150, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx - size, cy + size / 2, size * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Circle centered at B (appears at ~50% animation)
      const circle2Visible = progress > 0.4;
      if (circle2Visible) {
        ctx.strokeStyle = "rgba(150, 100, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx + size, cy + size / 2, size * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Intersection point C (appears at ~75% animation)
      const cVisible = progress > 0.65;
      if (cVisible) {
        const cx2 = cx;
        const cy2 = cy - size * Math.sqrt(3) * 0.6;

        // Line AC
        ctx.strokeStyle = "rgba(100, 200, 150, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - size, cy + size / 2);
        ctx.lineTo(cx2, cy2);
        ctx.stroke();

        // Line BC
        ctx.beginPath();
        ctx.moveTo(cx + size, cy + size / 2);
        ctx.lineTo(cx2, cy2);
        ctx.stroke();

        // Point C
        ctx.fillStyle = "rgba(100, 200, 150, 0.9)";
        ctx.beginPath();
        ctx.arc(cx2, cy2, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Labels
      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "12px sans-serif";
      ctx.fillText("A", cx - size - 15, cy + size / 2 + 20);
      ctx.fillText("B", cx + size + 5, cy + size / 2 + 20);

      if (cVisible) {
        ctx.fillText("C", cx + 10, cy - size * Math.sqrt(3) * 0.6 - 10);
      }

      // Title
      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "13px sans-serif";
      ctx.fillText(
        "Euclid I.1: Construct an Equilateral Triangle",
        20,
        30
      );

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
      aria-label="Euclid's Elements: Construction of an equilateral triangle"
    />
  );
}
