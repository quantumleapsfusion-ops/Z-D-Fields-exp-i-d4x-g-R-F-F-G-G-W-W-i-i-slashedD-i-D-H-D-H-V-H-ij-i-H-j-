"use client";

import { useEffect, useRef } from "react";

export function FourierSeriesIllustration() {
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
      const t = prefersReducedMotion ? 0 : (elapsed % 8000) / 8000;

      // Clear canvas
      ctx.fillStyle = "#0a0e27";
      ctx.fillRect(0, 0, w, h);

      // Title
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText("Fourier Series: Building Complex Waves from Simple Harmonics", 20, 25);

      const startX = 40;
      const startY = 50;
      const waveWidth = w - 80;
      const waveHeight = 40;

      // Draw individual sine waves
      const colors = ["#4a9eff", "#ff6b9d", "#4ade80"];
      const frequencies = [1, 3, 5];
      const amplitudes = [1, 0.33, 0.2];

      for (let i = 0; i < 3; i++) {
        const y = startY + i * 80;
        const freq = frequencies[i];
        const amp = amplitudes[i];
        const color = colors[i];

        // Draw wave label
        ctx.font = "10px sans-serif";
        ctx.fillStyle = color;
        ctx.textAlign = "right";
        ctx.fillText(`f${i + 1}: ${freq}x`, startX - 10, y + 5);

        // Draw sine wave
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = startX; x < startX + waveWidth; x++) {
          const normalizedX = (x - startX) / waveWidth;
          const phase = normalizedX * Math.PI * 2 * freq + t * Math.PI * 2;
          const yVal = y + Math.sin(phase) * amp * waveHeight;

          if (x === startX) {
            ctx.moveTo(x, yVal);
          } else {
            ctx.lineTo(x, yVal);
          }
        }
        ctx.stroke();
      }

      // Draw combined Fourier series
      const combinedY = startY + 3 * 80 + 20;
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#fbbf24";
      ctx.textAlign = "right";
      ctx.fillText("Sum (Fourier):", startX - 10, combinedY + 5);

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let x = startX; x < startX + waveWidth; x++) {
        const normalizedX = (x - startX) / waveWidth;
        const phase = normalizedX * Math.PI * 2 + t * Math.PI * 2;

        let yVal = combinedY;
        for (let i = 0; i < 3; i++) {
          const freq = frequencies[i];
          const amp = amplitudes[i];
          yVal +=
            Math.sin(phase * freq) *
            amp *
            waveHeight;
        }

        if (x === startX) {
          ctx.moveTo(x, yVal);
        } else {
          ctx.lineTo(x, yVal);
        }
      }
      ctx.stroke();

      // Draw baseline
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const y = startY + i * 80;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + waveWidth, y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(startX, combinedY);
      ctx.lineTo(startX + waveWidth, combinedY);
      ctx.stroke();

      // Description
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#ffffff70";
      ctx.textAlign = "left";
      ctx.fillText(
        "Any periodic function can be expressed as a sum of sine and cosine waves. This decomposition",
        20,
        h - 30
      );
      ctx.fillText(
        "is the foundation of signal processing, music, images, and quantum mechanics.",
        20,
        h - 15
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-white/10 bg-slate-950"
      style={{ aspectRatio: "16/9", display: "block" }}
    />
  );
}
