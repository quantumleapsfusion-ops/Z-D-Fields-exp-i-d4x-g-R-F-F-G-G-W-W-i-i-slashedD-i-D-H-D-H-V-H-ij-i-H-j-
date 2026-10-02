"use client";

import { useEffect, useRef } from "react";

/**
 * Parametric curves: Circles, Cycloids, Lissajous Figures, Helices
 */
export function ParametricCurvesIllustration() {
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

      // Split canvas into 2x2 grid
      const qw = w / 2;
      const qh = h / 2;
      const cx = qw / 2;
      const cy = qh / 2;
      const scale = 50;

      // 1. Circle: x = r*cos(t), y = r*sin(t)
      ctx.fillStyle = "rgba(60, 60, 70, 0.5)";
      ctx.fillRect(0, 0, qw, qh);

      ctx.strokeStyle = "rgba(100, 150, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        const x = cx + Math.cos(angle) * scale;
        const y = cy + Math.sin(angle) * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "11px sans-serif";
      ctx.fillText("Circle", 10, qh - 10);

      // 2. Lissajous: x = sin(3t), y = sin(2t)
      ctx.fillStyle = "rgba(60, 60, 70, 0.5)";
      ctx.fillRect(qw, 0, qw, qh);

      ctx.strokeStyle = "rgba(150, 100, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const angle = (i / 200) * Math.PI * 2;
        const x = qw + cx + Math.sin(3 * angle) * scale;
        const y = cy + Math.sin(2 * angle) * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.fillText("Lissajous", qw + 10, qh - 10);

      // 3. Cycloid: x = r(t - sin(t)), y = r(1 - cos(t))
      ctx.fillStyle = "rgba(60, 60, 70, 0.5)";
      ctx.fillRect(0, qh, qw, qh);

      const r = 20;
      ctx.strokeStyle = "rgba(100, 255, 150, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const angle = (i / 200) * Math.PI * 4;
        const x = (i / 200) * qw + 20;
        const y = qh + cy - r * (1 - Math.cos(angle)) + r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.fillText("Cycloid", 10, h - 10);

      // 4. Animated tracing point on Lissajous
      ctx.fillStyle = "rgba(60, 60, 70, 0.5)";
      ctx.fillRect(qw, qh, qw, qh);

      const angle = (t % (Math.PI * 2));
      const traceX = qw + cx + Math.sin(3 * angle) * scale;
      const traceY = qh + cy + Math.sin(2 * angle) * scale;

      ctx.fillStyle = "rgba(255, 150, 100, 0.9)";
      ctx.beginPath();
      ctx.arc(traceX, traceY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.fillText("Parametric Motion", qw + 10, h - 10);

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
      aria-label="Parametric curves: circles, Lissajous figures, and cycloids"
    />
  );
}
