"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive Vector Illustration: Addition, Dot Product, Cross Product
 */
export function VectorIllustration() {
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

      const cx = w / 2;
      const cy = h / 2;
      const scale = 60;

      // Vector A
      const ax = 2 * Math.cos(t);
      const ay = 1.5 * Math.sin(t);

      // Vector B
      const bx = 1.5 * Math.cos(t + Math.PI / 3);
      const by = 2 * Math.sin(t + Math.PI / 3);

      // Draw origin point
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw vector A
      ctx.strokeStyle = "rgba(100, 150, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + ax * scale, cy - ay * scale);
      ctx.stroke();

      // Arrowhead for A
      const angle1 = Math.atan2(-ay, ax);
      ctx.beginPath();
      ctx.moveTo(cx + ax * scale, cy - ay * scale);
      ctx.lineTo(
        cx + ax * scale - 10 * Math.cos(angle1 - Math.PI / 6),
        cy - ay * scale + 10 * Math.sin(angle1 - Math.PI / 6)
      );
      ctx.moveTo(cx + ax * scale, cy - ay * scale);
      ctx.lineTo(
        cx + ax * scale - 10 * Math.cos(angle1 + Math.PI / 6),
        cy - ay * scale + 10 * Math.sin(angle1 + Math.PI / 6)
      );
      ctx.stroke();

      // Draw vector B
      ctx.strokeStyle = "rgba(150, 100, 255, 0.8)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + bx * scale, cy - by * scale);
      ctx.stroke();

      // Arrowhead for B
      const angle2 = Math.atan2(-by, bx);
      ctx.beginPath();
      ctx.moveTo(cx + bx * scale, cy - by * scale);
      ctx.lineTo(
        cx + bx * scale - 10 * Math.cos(angle2 - Math.PI / 6),
        cy - by * scale + 10 * Math.sin(angle2 - Math.PI / 6)
      );
      ctx.moveTo(cx + bx * scale, cy - by * scale);
      ctx.lineTo(
        cx + bx * scale - 10 * Math.cos(angle2 + Math.PI / 6),
        cy - by * scale + 10 * Math.sin(angle2 + Math.PI / 6)
      );
      ctx.stroke();

      // Draw vector sum (A + B)
      const sumx = ax + bx;
      const sumy = ay + by;
      ctx.strokeStyle = "rgba(100, 255, 150, 0.6)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + sumx * scale, cy - sumy * scale);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw labels
      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "12px sans-serif";
      ctx.fillText("A", cx + ax * scale - 15, cy - ay * scale - 5);
      ctx.fillText("B", cx + bx * scale - 15, cy - by * scale + 15);
      ctx.fillText("A + B", cx + sumx * scale + 5, cy - sumy * scale - 10);

      // Dot product info
      const dotProd = ax * bx + ay * by;
      ctx.fillStyle = "rgba(150, 200, 255, 0.7)";
      ctx.font = "11px mono";
      ctx.fillText(`A · B = ${dotProd.toFixed(2)}`, 20, h - 40);

      // Angle between vectors
      const magA = Math.sqrt(ax * ax + ay * ay);
      const magB = Math.sqrt(bx * bx + by * by);
      const angle = Math.acos(dotProd / (magA * magB));
      ctx.fillText(`θ = ${(angle * (180 / Math.PI)).toFixed(1)}°`, 20, h - 20);

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
      aria-label="Vector illustration showing vector addition, dot product, and angle between vectors"
    />
  );
}
