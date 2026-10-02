"use client";

import { useEffect, useRef } from "react";

export function ComplexNumbersIllustration() {
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

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = prefersReducedMotion ? 0 : (elapsed % 6000) / 6000;

      // Clear canvas
      ctx.fillStyle = "#0a0e27";
      ctx.fillRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;
      const scale = 60;

      // Draw axes
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 1;

      // Real axis (horizontal)
      ctx.beginPath();
      ctx.moveTo(centerX - 150, centerY);
      ctx.lineTo(centerX + 150, centerY);
      ctx.stroke();

      // Imaginary axis (vertical)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 150);
      ctx.lineTo(centerX, centerY + 150);
      ctx.stroke();

      // Axis labels
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#ffffff70";
      ctx.textAlign = "center";
      ctx.fillText("Real", centerX + 150, centerY + 20);
      ctx.fillText("i (Imaginary)", centerX - 20, centerY - 150);

      // Grid
      ctx.strokeStyle = "#1a2a4a";
      ctx.lineWidth = 0.5;
      for (let i = -3; i <= 3; i++) {
        // Vertical
        ctx.beginPath();
        ctx.moveTo(centerX + i * scale, centerY - 120);
        ctx.lineTo(centerX + i * scale, centerY + 120);
        ctx.stroke();

        // Horizontal
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY + i * scale);
        ctx.lineTo(centerX + 120, centerY + i * scale);
        ctx.stroke();
      }

      // Draw rotating complex numbers
      const angle = t * Math.PI * 2;

      // Number 1
      const z1Real = Math.cos(angle);
      const z1Imag = Math.sin(angle);
      drawComplexNumber(
        ctx,
        centerX,
        centerY,
        z1Real,
        z1Imag,
        scale,
        "#4a9eff",
        "1"
      );

      // Number 2
      const z2Real = 2 * Math.cos(angle + (Math.PI * 2) / 3);
      const z2Imag = 2 * Math.sin(angle + (Math.PI * 2) / 3);
      drawComplexNumber(
        ctx,
        centerX,
        centerY,
        z2Real,
        z2Imag,
        scale,
        "#ff6b9d",
        "2"
      );

      // Number 3
      const z3Real = 1.5 * Math.cos(angle + (Math.PI * 4) / 3);
      const z3Imag = 1.5 * Math.sin(angle + (Math.PI * 4) / 3);
      drawComplexNumber(
        ctx,
        centerX,
        centerY,
        z3Real,
        z3Imag,
        scale,
        "#4ade80",
        "3"
      );

      // Draw unit circle
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, scale, 0, Math.PI * 2);
      ctx.stroke();

      // Draw circles for magnitude 2 and 1.5
      ctx.strokeStyle = "#2a3a5a";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, scale * 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, scale * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Description at bottom
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#ffffff70";
      ctx.textAlign = "center";
      ctx.fillText(
        "Complex numbers extend the real line to a 2D plane, with real and imaginary parts.",
        w / 2,
        h - 20
      );
      ctx.fillText(
        "Every complex number z = a + bi can be visualized as a point (a, b) or a rotating vector.",
        w / 2,
        h - 8
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);

    function drawComplexNumber(
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      real: number,
      imag: number,
      scale: number,
      color: string,
      label: string
    ) {
      const x = centerX + real * scale;
      const y = centerY - imag * scale; // Negative because canvas y increases downward

      // Arrow from origin
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Point
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = "10px sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "left";
      const labelX = x + 8;
      const labelY = y - 2;
      ctx.fillText(`z${label}`, labelX, labelY);

      // Coordinates
      ctx.font = "9px sans-serif";
      ctx.fillStyle = color;
      ctx.fillStyle = color + "99";
      const realStr = real.toFixed(2);
      const imagStr = imag.toFixed(2);
      ctx.fillText(
        `${realStr}${imag >= 0 ? "+" : ""}${imagStr}i`,
        labelX,
        labelY + 12
      );
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
