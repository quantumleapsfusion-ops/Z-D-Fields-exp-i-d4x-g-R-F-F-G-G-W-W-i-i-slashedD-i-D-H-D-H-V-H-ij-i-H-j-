"use client";

import { useEffect, useRef } from "react";

export function AlgebraIllustration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Clear canvas
    ctx.fillStyle = "#0a0e27";
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("Solving: 2x + 3 = 11", w / 2, 30);

    // Step 1: Initial equation
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#4a9eff";
    ctx.textAlign = "left";
    ctx.fillText("Step 1: 2x + 3 = 11", 30, 70);

    // Diagram showing the equation
    drawBalance(ctx, w / 4, 110, [
      { label: "2x", count: 2, color: "#ff6b9d" },
      { label: "+3", count: 3, color: "#4ade80" },
    ]);
    ctx.fillText("= 11", w / 2, 135);
    drawCircles(ctx, (3 * w) / 4, 110, 11, "#fbbf24");

    // Step 2: Subtract 3 from both sides
    ctx.fillStyle = "#4a9eff";
    ctx.fillText("Step 2: Subtract 3 from both sides", 30, 180);
    ctx.fillStyle = "#ffffff99";
    ctx.font = "10px sans-serif";
    ctx.fillText("2x + 3 − 3 = 11 − 3", 50, 200);

    drawBalance(ctx, w / 4, 230, [
      { label: "2x", count: 2, color: "#ff6b9d" },
    ]);
    ctx.font = "12px sans-serif";
    ctx.fillText("= 8", w / 2, 255);
    drawCircles(ctx, (3 * w) / 4, 230, 8, "#fbbf24");

    // Step 3: Divide both sides by 2
    ctx.fillStyle = "#4a9eff";
    ctx.fillText("Step 3: Divide both sides by 2", 30, 300);
    ctx.fillStyle = "#ffffff99";
    ctx.font = "10px sans-serif";
    ctx.fillText("2x ÷ 2 = 8 ÷ 2", 50, 320);

    // Final step: x = 4
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#4ade80";
    ctx.fillText("x = 4", 30, 380);
    ctx.fillStyle = "#ffffff99";
    ctx.font = "11px sans-serif";
    ctx.fillText(
      "Algebra uses symbols (variables) to represent unknown quantities",
      30,
      h - 30
    );
    ctx.fillText(
      "and rules for manipulating equations to solve problems systematically.",
      30,
      h - 15
    );

    function drawBalance(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      items: { label: string; count: number; color: string }[]
    ) {
      // Balance scale
      ctx.strokeStyle = "#666666";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 30, y);
      ctx.lineTo(x + 30, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 20);
      ctx.stroke();

      // Left pan
      ctx.strokeStyle = "#666666";
      ctx.fillStyle = "#333333";
      ctx.fillRect(x - 35, y + 20, 20, 15);
      ctx.strokeRect(x - 35, y + 20, 20, 15);

      // Right pan
      ctx.fillRect(x + 15, y + 20, 20, 15);
      ctx.strokeRect(x + 15, y + 20, 20, 15);

      // Draw items on left pan
      let offsetX = 0;
      items.forEach((item) => {
        for (let i = 0; i < item.count; i++) {
          ctx.fillStyle = item.color;
          ctx.fillRect(x - 33 + offsetX, y + 25, 8, 8);
          offsetX += 10;
        }
      });
    }

    function drawCircles(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      count: number,
      color: string
    ) {
      ctx.fillStyle = color;
      let col = 0;
      let row = 0;
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.arc(x - 30 + col * 15, y + row * 15, 4, 0, Math.PI * 2);
        ctx.fill();
        col++;
        if (col > 3) {
          col = 0;
          row++;
        }
      }
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-white/10 bg-slate-950"
      style={{ aspectRatio: "16/9", display: "block" }}
    />
  );
}
