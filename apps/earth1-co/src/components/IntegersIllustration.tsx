"use client";

import { useEffect, useRef } from "react";

/**
 * Integers: Number line, operations, and properties
 */
export function IntegersIllustration() {
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

      const px = 40;
      const py = h / 2;
      const lineWidth = w - 2 * px;

      // Number line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + lineWidth, py);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(px + lineWidth, py);
      ctx.lineTo(px + lineWidth - 10, py - 5);
      ctx.moveTo(px + lineWidth, py);
      ctx.lineTo(px + lineWidth - 10, py + 5);
      ctx.stroke();

      // Negative arrow
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 10, py - 5);
      ctx.moveTo(px, py);
      ctx.lineTo(px + 10, py + 5);
      ctx.stroke();

      // Tick marks and labels
      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";

      for (let i = -5; i <= 5; i++) {
        const x = px + ((i + 5) / 10) * lineWidth;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, py - 4);
        ctx.lineTo(x, py + 4);
        ctx.stroke();

        ctx.fillText(i.toString(), x, py + 20);
      }

      // Highlight zero
      ctx.fillStyle = "rgba(100, 200, 150, 0.9)";
      ctx.beginPath();
      ctx.arc(px + (5 / 10) * lineWidth, py, 6, 0, Math.PI * 2);
      ctx.fill();

      // Addition example
      const addPos = 2;
      const addAmount = 3;
      const addResultPos = addPos + addAmount;

      ctx.strokeStyle = "rgba(100, 150, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + ((addPos + 5) / 10) * lineWidth, py - 40);
      ctx.lineTo(px + ((addResultPos + 5) / 10) * lineWidth, py - 40);
      ctx.stroke();

      ctx.fillStyle = "rgba(100, 150, 255, 0.8)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`+${addAmount}`, px + ((addPos + addAmount / 2 + 5) / 10) * lineWidth, py - 50);
      ctx.fillText(`${addPos} + ${addAmount} = ${addResultPos}`, w / 2, h - 40);

      // Subtraction example
      const subPos = 4;
      const subAmount = 2;
      const subResultPos = subPos - subAmount;

      ctx.strokeStyle = "rgba(150, 100, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + ((subPos + 5) / 10) * lineWidth, py + 40);
      ctx.lineTo(px + ((subResultPos + 5) / 10) * lineWidth, py + 40);
      ctx.stroke();

      ctx.fillStyle = "rgba(150, 100, 255, 0.8)";
      ctx.fillText(`−${subAmount}`, px + ((subResultPos + subAmount / 2 + 5) / 10) * lineWidth, py + 50);

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
      aria-label="Integers illustration showing number line with addition and subtraction"
    />
  );
}
