"use client";

import { useEffect, useRef } from "react";

/**
 * Division and Modular Arithmetic: The division algorithm and remainders
 */
export function DivisionIllustration() {
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
      const py = 60;
      const boxSize = 60;
      const spacing = 90;

      // Title
      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Division Algorithm: a = qb + r", px, py - 20);

      // Example 1: 17 ÷ 5
      const a1 = 17;
      const b1 = 5;
      const q1 = Math.floor(a1 / b1);
      const r1 = a1 % b1;

      ctx.fillStyle = "rgba(100, 150, 255, 0.9)";
      ctx.fillRect(px, py, boxSize, boxSize);
      ctx.fillStyle = "rgba(10, 10, 15, 0.95)";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(a1.toString(), px + boxSize / 2, py + boxSize / 2);

      ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("a", px + boxSize / 2, py + boxSize + 20);

      // Division sign
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + boxSize + 15, py + boxSize / 2);
      ctx.lineTo(px + spacing - 15, py + boxSize / 2);
      ctx.stroke();

      // b
      ctx.fillStyle = "rgba(150, 100, 255, 0.9)";
      ctx.fillRect(px + spacing, py, boxSize, boxSize);
      ctx.fillStyle = "rgba(10, 10, 15, 0.95)";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(b1.toString(), px + spacing + boxSize / 2, py + boxSize / 2);

      ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("b", px + spacing + boxSize / 2, py + boxSize + 20);

      // Equals sign
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + spacing * 2 - 15, py + boxSize / 2 - 4);
      ctx.lineTo(px + spacing * 2 + 15, py + boxSize / 2 - 4);
      ctx.moveTo(px + spacing * 2 - 15, py + boxSize / 2 + 4);
      ctx.lineTo(px + spacing * 2 + 15, py + boxSize / 2 + 4);
      ctx.stroke();

      // Quotient
      ctx.fillStyle = "rgba(100, 200, 150, 0.9)";
      ctx.fillRect(px + spacing * 2 + 20, py, boxSize, boxSize);
      ctx.fillStyle = "rgba(10, 10, 15, 0.95)";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(q1.toString(), px + spacing * 2 + 20 + boxSize / 2, py + boxSize / 2);

      ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("q", px + spacing * 2 + 20 + boxSize / 2, py + boxSize + 20);

      // Plus
      ctx.fillStyle = "rgba(255, 150, 100, 0.7)";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("+", px + spacing * 3 + 40, py + boxSize / 2 + 6);

      // Remainder
      ctx.fillStyle = "rgba(255, 150, 100, 0.9)";
      ctx.fillRect(px + spacing * 3 + 60, py, boxSize, boxSize);
      ctx.fillStyle = "rgba(10, 10, 15, 0.95)";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(r1.toString(), px + spacing * 3 + 60 + boxSize / 2, py + boxSize / 2);

      ctx.fillStyle = "rgba(200, 200, 200, 0.7)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("r", px + spacing * 3 + 60 + boxSize / 2, py + boxSize + 20);

      // Equation below
      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "12px mono";
      ctx.textAlign = "left";
      ctx.fillText(
        `${a1} = ${q1} × ${b1} + ${r1}`,
        px,
        py + boxSize + 60
      );

      // Modular arithmetic example
      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "12px mono";
      ctx.textAlign = "left";
      ctx.fillText(`${a1} mod ${b1} = ${r1}`, px, py + boxSize + 85);
      ctx.fillText("(the remainder when divided)", px + 150, py + boxSize + 85);
    };

    draw();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-96 rounded border border-white/20"
      aria-label="Division algorithm illustration with quotient and remainder"
    />
  );
}
