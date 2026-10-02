"use client";

import { useEffect, useRef } from "react";

export function TopologyIllustration() {
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

      // Draw torus (left side)
      drawTorus(ctx, w / 4, h / 2, 35, t);

      // Draw Möbius strip (right side)
      drawMobiusStrip(ctx, (3 * w) / 4, h / 2, 30, t);

      // Labels
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("Torus", w / 4, h - 20);
      ctx.fillText("Möbius Strip", (3 * w) / 4, h - 20);

      // Description
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#ffffff70";
      ctx.textAlign = "left";
      ctx.fillText(
        "Topology studies shapes and their properties that remain unchanged by continuous deformation.",
        20,
        25
      );
      ctx.fillText(
        "A torus has genus 1; a Möbius strip has only one side. These properties are topological invariants.",
        20,
        40
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);

    function drawTorus(
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      majorRadius: number,
      t: number
    ) {
      const minorRadius = 12;
      const angle = t * Math.PI * 2;

      // Draw torus as series of circles
      ctx.strokeStyle = "#4a9eff";
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 16; i++) {
        const phi = (i / 16) * Math.PI * 2;

        for (let j = 0; j < 32; j++) {
          const theta = (j / 32) * Math.PI * 2 + angle;

          const x =
            centerX +
            (majorRadius + minorRadius * Math.cos(theta)) * Math.cos(phi);
          const y =
            centerY +
            (majorRadius + minorRadius * Math.cos(theta)) * Math.sin(phi);
          const z = minorRadius * Math.sin(theta);

          // Simple perspective (higher z = higher on screen)
          const screenY = y - z * 0.3;

          if (j === 0) {
            ctx.beginPath();
            ctx.moveTo(x, screenY);
          } else {
            ctx.lineTo(x, screenY);
          }
        }
        ctx.stroke();
      }

      // Draw meridian circles
      ctx.strokeStyle = "#ff6b9d";
      ctx.lineWidth = 1;

      for (let i = 0; i < 8; i++) {
        const phi = (i / 8) * Math.PI * 2 + angle * 0.5;
        ctx.beginPath();

        for (let j = 0; j < 32; j++) {
          const theta = (j / 32) * Math.PI * 2;

          const x =
            centerX +
            (majorRadius + minorRadius * Math.cos(theta)) * Math.cos(phi);
          const y =
            centerY +
            (majorRadius + minorRadius * Math.cos(theta)) * Math.sin(phi);
          const z = minorRadius * Math.sin(theta);

          const screenY = y - z * 0.3;

          if (j === 0) {
            ctx.moveTo(x, screenY);
          } else {
            ctx.lineTo(x, screenY);
          }
        }
        ctx.stroke();
      }
    }

    function drawMobiusStrip(
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      t: number
    ) {
      const angle = t * Math.PI * 2;

      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 1.5;

      // Draw Möbius strip as rotating band with twist
      for (let i = 0; i < 32; i++) {
        const u = (i / 32) * Math.PI * 2;
        ctx.beginPath();

        for (let j = 0; j < 24; j++) {
          const v = (j / 24) * 2 - 1; // -1 to 1

          // Möbius parametrization with twist
          const r = radius + v * 12 * Math.cos(u / 2);
          const theta = u + angle;
          const twist = u / 2; // Half-twist for Möbius property

          const x = centerX + r * Math.cos(theta);
          const y = centerY + r * Math.sin(theta);
          const z = v * 12 * Math.sin(u / 2);

          const screenY = y - z * 0.3;

          if (j === 0) {
            ctx.moveTo(x, screenY);
          } else {
            ctx.lineTo(x, screenY);
          }
        }
        ctx.stroke();
      }

      // Draw edge of strip
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let i = 0; i < 48; i++) {
        const u = (i / 48) * Math.PI * 4; // Go around twice to show the twist
        const theta = u + angle;

        const x = centerX + radius * Math.cos(theta);
        const y = centerY + radius * Math.sin(theta);
        const z = Math.sin(u / 2) * 10;

        const screenY = y - z * 0.3;

        if (i === 0) {
          ctx.moveTo(x, screenY);
        } else {
          ctx.lineTo(x, screenY);
        }
      }
      ctx.stroke();
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
