"use client";

import { useEffect, useRef } from "react";

export function EuclideanVsNonEuclideanIllustration() {
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

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Clear canvas
    ctx.fillStyle = "#0a0e27";
    ctx.fillRect(0, 0, w, h);

    // Title for each geometry
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("Euclidean Geometry", w / 4, 20);
    ctx.fillText("Hyperbolic Geometry", (3 * w) / 4, 20);

    // Euclidean: parallel lines stay parallel
    ctx.strokeStyle = "#4a9eff";
    ctx.lineWidth = 2;

    // Euclidean base line
    ctx.beginPath();
    ctx.moveTo(20, 80);
    ctx.lineTo(w / 2 - 20, 80);
    ctx.stroke();

    // Euclidean parallel line
    ctx.beginPath();
    ctx.moveTo(20, 130);
    ctx.lineTo(w / 2 - 20, 130);
    ctx.stroke();

    // Label: "Parallel lines never meet"
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#ffffff99";
    ctx.textAlign = "center";
    ctx.fillText("Parallel lines never meet", w / 4, 170);

    // Hyperbolic: parallel lines diverge
    ctx.strokeStyle = "#ff6b9d";
    ctx.lineWidth = 2;

    // Hyperbolic - simulate curvature with quadratic curves
    const hyperboleFn = (x: number, curve: number) => {
      const normalized = (x - (w / 2 + 20)) / ((w / 2 - 40) / 2);
      return 80 + curve * (normalized * normalized);
    };

    // Hyperbolic line 1
    ctx.beginPath();
    ctx.moveTo(w / 2 + 20, 80);
    for (let x = w / 2 + 20; x < w - 20; x += 5) {
      ctx.lineTo(x, hyperboleFn(x, 0.3));
    }
    ctx.stroke();

    // Hyperbolic line 2 (more curved - diverges)
    ctx.beginPath();
    ctx.moveTo(w / 2 + 20, 130);
    for (let x = w / 2 + 20; x < w - 20; x += 5) {
      ctx.lineTo(x, hyperboleFn(x, 0.5));
    }
    ctx.stroke();

    // Label: "Parallel lines diverge"
    ctx.fillStyle = "#ffffff99";
    ctx.fillText("Parallel lines diverge", (3 * w) / 4, 170);

    // Triangle illustration: Euclidean vs Hyperbolic angle sum
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("Angle Sum Property", w / 4, 230);
    ctx.fillText("Angle Sum Property", (3 * w) / 4, 230);

    // Euclidean triangle
    ctx.strokeStyle = "#4a9eff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 4 - 40, 280);
    ctx.lineTo(w / 4 + 40, 280);
    ctx.lineTo(w / 4, 320);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "#ffffff99";
    ctx.font = "10px sans-serif";
    ctx.fillText("Sum = 180°", w / 4, 345);

    // Hyperbolic triangle (curved sides)
    ctx.strokeStyle = "#ff6b9d";
    ctx.lineWidth = 2;

    const centerX = (3 * w) / 4;
    const centerY = 300;
    const radius = 40;

    // Draw hyperbolic triangle as curved triangle on pseudosphere-like surface
    ctx.beginPath();
    ctx.arc(centerX - 30, centerY - 20, radius, 0, Math.PI, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX + 30, centerY - 20, radius, 0, Math.PI, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - 30, centerY - 20);
    ctx.lineTo(centerX + 30, centerY - 20);
    ctx.stroke();

    ctx.fillStyle = "#ffffff99";
    ctx.fillText("Sum < 180°", (3 * w) / 4, 345);

    // Description at bottom
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#ffffff70";
    ctx.textAlign = "left";
    ctx.fillText(
      "Euclidean geometry on flat spaces. Non-Euclidean geometries (hyperbolic, spherical)",
      20,
      h - 20
    );
    ctx.fillText(
      "curve in space and change fundamental properties like parallel lines and angle sums.",
      20,
      h - 8
    );
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-white/10 bg-slate-950"
      style={{ aspectRatio: "16/9", display: "block" }}
    />
  );
}
