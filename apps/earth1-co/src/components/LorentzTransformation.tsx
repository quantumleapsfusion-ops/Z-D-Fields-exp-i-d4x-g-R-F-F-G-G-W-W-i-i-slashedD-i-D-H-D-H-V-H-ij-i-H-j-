"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lorentz Transformation Visualizer showing:
 * - How spacetime coordinates transform between reference frames
 * - Relativity of simultaneity and length contraction through transformation
 * - Invariant spacetime interval preserved under Lorentz boost
 */
export function LorentzTransformation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [velocity, setVelocity] = useState(0.6);
  const [showEvent, setShowEvent] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    let frameCount = 0;

    const render = () => {
      frameCount += 1;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      // Title
      ctx.fillStyle = "#fff";
      ctx.font = "16px sans-serif";
      ctx.fillText("Lorentz Transformation: Coordinates Between Reference Frames", 20, 30);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#888";
      ctx.fillText(
        "The Lorentz transformation relates coordinates (x, t) in one frame to coordinates (x', t') in a moving frame.",
        20,
        50
      );

      const centerX = w / 2;
      const centerY = h / 2.5;
      const scale = 60;

      // Rest frame grid
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + i * scale, centerY - 3 * scale);
        ctx.lineTo(centerX + i * scale, centerY + 3 * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - 3 * scale, centerY + i * scale);
        ctx.lineTo(centerX + 3 * scale, centerY + i * scale);
        ctx.stroke();
      }

      // Rest frame axes
      ctx.strokeStyle = "#4da6ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 3 * scale, centerY);
      ctx.lineTo(centerX + 3 * scale, centerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 3 * scale);
      ctx.lineTo(centerX, centerY + 3 * scale);
      ctx.stroke();

      // Rest frame labels
      ctx.fillStyle = "#4da6ff";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("x", centerX + 3 * scale + 10, centerY - 5);
      ctx.fillText("t", centerX - 5, centerY - 3 * scale - 5);

      // Moving frame axes (boosted)
      const beta = velocity;
      const gamma = 1 / Math.sqrt(1 - beta * beta);

      ctx.strokeStyle = "#ff6b9d";
      ctx.lineWidth = 2;

      // x' axis (tilted by angle θ where tan(θ) = β)
      const theta = Math.atan(beta);
      const xPrimeLength = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(centerX - xPrimeLength * Math.cos(theta), centerY - xPrimeLength * Math.sin(theta));
      ctx.lineTo(centerX + xPrimeLength * Math.cos(theta), centerY + xPrimeLength * Math.sin(theta));
      ctx.stroke();

      // t' axis (tilted by angle θ in time direction)
      ctx.beginPath();
      ctx.moveTo(centerX - xPrimeLength * Math.sin(theta), centerY - xPrimeLength * Math.cos(theta));
      ctx.lineTo(centerX + xPrimeLength * Math.sin(theta), centerY + xPrimeLength * Math.cos(theta));
      ctx.stroke();

      // Moving frame labels
      ctx.fillStyle = "#ff6b9d";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("x'", centerX + xPrimeLength * Math.cos(theta) + 5, centerY + xPrimeLength * Math.sin(theta));
      ctx.fillText("t'", centerX + xPrimeLength * Math.sin(theta) - 15, centerY + xPrimeLength * Math.cos(theta) - 5);

      // Event point
      if (showEvent) {
        const eventX = scale;
        const eventY = scale;

        // Rest frame event
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        ctx.arc(centerX + eventX, centerY + eventY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Transform to primed coordinates
        const xPrime = gamma * (eventX - beta * scale * eventY / scale);
        const tPrime = gamma * (eventY / scale - beta * eventX / scale);

        // Show event in both frames
        ctx.fillStyle = "#ffff00";
        ctx.font = "10px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`Event: (x=${(eventX / scale).toFixed(1)}, t=${(eventY / scale).toFixed(1)})`, 20, h - 200);
        ctx.fillText(`x' = γ(x - βct) = ${xPrime.toFixed(2)}`, 20, h - 185);
        ctx.fillText(`t' = γ(t - βx/c) = ${tPrime.toFixed(2)}`, 20, h - 170);
      }

      // Info box
      ctx.fillStyle = "#111";
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.fillRect(20, h - 140, 450, 120);
      ctx.strokeRect(20, h - 140, 450, 120);

      ctx.fillStyle = "#aaa";
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      ctx.fillText("Lorentz Transformation (boost along x):", 30, h - 125);
      ctx.fillStyle = "#888";
      ctx.fillText(`x' = γ(x - vt),  t' = γ(t - vx/c²),  γ = 1/√(1 - v²/c²)`, 30, h - 110);
      ctx.fillText(`Current β = v/c = ${velocity.toFixed(2)},  γ = ${gamma.toFixed(3)}`, 30, h - 95);

      ctx.fillStyle = "#666";
      ctx.font = "10px sans-serif";
      ctx.fillText("• Spacetime interval s² = -c²t² + x² is invariant", 30, h - 75);
      ctx.fillText("• Relativity of simultaneity: events simultaneous in one frame", 30, h - 60);
      ctx.fillText("  are not simultaneous in another", 30, h - 45);
      ctx.fillText("• Axes rotate as velocity increases (approaching 45° at c)", 30, h - 30);
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => clearInterval(animationId);
  }, [velocity, showEvent]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspectRatio: "640 / 480" }}
        />
        <figcaption className="sr-only">
          Visualization of Lorentz transformation showing how spacetime coordinates change
          between reference frames.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <span className="text-sm">Velocity of frame (β = v/c):</span>
            <input
              type="range"
              min="0"
              max="0.99"
              step="0.01"
              value={velocity}
              onChange={(e) => setVelocity(Number(e.target.value))}
              className="w-40"
            />
            <span className="text-sm">{(velocity * 100).toFixed(0)}% c</span>
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showEvent}
            onChange={(e) => setShowEvent(e.target.checked)}
            className="rounded border-gray-600"
          />
          <span className="text-sm">Show event coordinates</span>
        </label>

        <p className="source text-sm leading-relaxed">
          The Lorentz transformation lies at the heart of special relativity. Blue axes show
          the rest frame (S), while red axes show a frame moving with velocity v (S&apos;).
          As velocity increases, the x&apos; and t&apos; axes tilt toward the light cone (the
          45° diagonal). The spacetime interval, s² = −c²t² + x², is the same in all frames:
          this is spacetime&apos;s metric, its fundamental geometry. The transformation
          reveals why simultaneity is relative: two events at the same time in frame S occur
          at different times in frame S&apos;.
        </p>
      </div>
    </div>
  );
}
