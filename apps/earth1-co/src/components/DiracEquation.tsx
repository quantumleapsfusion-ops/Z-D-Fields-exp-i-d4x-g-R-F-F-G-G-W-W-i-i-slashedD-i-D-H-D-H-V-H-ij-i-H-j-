"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

/**
 * Dirac Equation Visualizer showing:
 * - Dirac equation rendered in mathematical form
 * - Energy diagram with positive and negative energy branches
 * - Spin-½ particle (electron) and antiparticle (positron)
 * - Pair creation and annihilation interpretation
 */
export function DiracEquation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showAntiparticles, setShowAntiparticles] = useState(true);
  const [mode, setMode] = useState<"energy" | "spin">("energy");

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

      if (mode === "energy") {
        renderEnergyDiagram(ctx, w, h, frameCount, showAntiparticles);
      } else {
        renderSpinVisualization(ctx, w, h, frameCount);
      }
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => clearInterval(animationId);
  }, [mode, showAntiparticles]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspectRatio: "640 / 480" }}
        />
        <figcaption className="sr-only">
          Visualization of the Dirac equation showing energy branches and spin-½
          particles.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`toggle ${mode === "energy" ? "active" : ""}`}
            onClick={() => setMode("energy")}
          >
            Energy Branches
          </button>
          <button
            type="button"
            className={`toggle ${mode === "spin" ? "active" : ""}`}
            onClick={() => setMode("spin")}
          >
            Spin-½ States
          </button>
        </div>

        {mode === "energy" && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAntiparticles}
              onChange={(e) => setShowAntiparticles(e.target.checked)}
              className="rounded border-gray-600"
            />
            <span className="text-sm">Show antiparticles (positrons)</span>
          </label>
        )}

        <p className="source text-sm leading-relaxed">
          The Dirac equation unified quantum mechanics and special relativity, predicting
          that electrons have spin-½ and that negative-energy solutions represent
          antiparticles. The positron, the electron&apos;s antimatter counterpart, was
          predicted by Dirac&apos;s mathematics before being experimentally discovered.
          This visualization shows how the energy spectrum has both positive (electron)
          and negative (positron) branches, separated by 2mc² where m is the electron
          mass.
        </p>
      </div>
    </div>
  );
}

function renderEnergyDiagram(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameCount: number,
  showAntiparticles: boolean,
) {
  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Dirac Equation: Energy Spectrum", 20, 30);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(
    "The Dirac equation predicts both electrons (positive energy) and positrons (negative energy). Pair creation bridges the energy gap.",
    20,
    50,
  );

  const centerX = w / 2;
  const centerY = h / 2;
  const scale = 100;

  // Draw energy axis
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 200, centerY - scale * 3);
  ctx.lineTo(centerX - 200, centerY + scale * 3);
  ctx.stroke();

  // Energy labels
  ctx.fillStyle = "#aaa";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("E = +mc²", centerX - 210, centerY - scale * 2 + 5);
  ctx.fillText("E = 0", centerX - 210, centerY + 5);
  ctx.fillText("E = -mc²", centerX - 210, centerY + scale * 2 + 5);

  // Positive energy (electron) branch
  ctx.fillStyle = "#4da6ff";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Electrons", centerX - 180, centerY - scale * 2.2);

  // Draw electron states as moving circles
  for (let i = 0; i < 3; i++) {
    const angle = (frameCount * 0.03 + i * Math.PI * 0.6) % (Math.PI * 2);
    const y = centerY - scale * 2 + Math.sin(angle) * 20;
    ctx.fillStyle = "#4da6ff";
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(centerX + 50 + i * 60, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Energy gap (Dirac sea)
  ctx.fillStyle = "rgba(100, 50, 20, 0.2)";
  ctx.fillRect(centerX - 250, centerY - scale, centerX + 250, scale * 2);
  ctx.strokeStyle = "#663300";
  ctx.lineWidth = 1;
  ctx.strokeRect(centerX - 250, centerY - scale, centerX + 250, scale * 2);

  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Energy gap = 2mc²", centerX + 100, centerY);

  if (showAntiparticles) {
    // Negative energy (positron) branch
    ctx.fillStyle = "#ff6b9d";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Positrons", centerX - 180, centerY + scale * 2.2);

    // Draw positron states as moving circles
    for (let i = 0; i < 3; i++) {
      const angle = (frameCount * 0.03 + i * Math.PI * 0.6) % (Math.PI * 2);
      const y = centerY + scale * 2 + Math.sin(angle) * 20;
      ctx.fillStyle = "#ff6b9d";
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(centerX + 50 + i * 60, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Pair creation arrow
    const arrowTime = (frameCount * 0.05) % 2;
    if (arrowTime < 1) {
      const progress = Math.sin(arrowTime * Math.PI * 0.5);
      const x = centerX + 150 + progress * 80;
      const y1 = centerY - scale * 2;
      const y2 = centerY + scale * 2;
      const currentY = y1 + (y2 - y1) * progress;

      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7 + progress * 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, currentY);
      ctx.stroke();

      // Particle appearance
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(x + 30, currentY, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;

      // Label
      ctx.fillStyle = "#ffff00";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Pair", x + 30, currentY - 20);
      ctx.fillText("Creation", x + 30, currentY + 25);
    }
  }

  // Formula box
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(20, h - 120, 350, 100);
  ctx.strokeRect(20, h - 120, 350, 100);

  ctx.fillStyle = "#aaa";
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Dirac Equation:", 30, h - 105);
  ctx.fillStyle = "#888";
  ctx.fillText("(iγ^μ ∂_μ - m)ψ = 0", 30, h - 90);
  ctx.fillText("Solutions: E = ±√(p²c² + m²c⁴)", 30, h - 75);

  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.fillText("γ^μ = Dirac gamma matrices", 30, h - 55);
  ctx.fillText("m = electron rest mass", 30, h - 40);
  ctx.fillText("Predicts spin-½ and antimatter", 30, h - 25);
}

function renderSpinVisualization(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameCount: number,
) {
  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Spin-½: The Two States", 20, 30);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(
    "Electrons are spin-½ particles with two spin states: spin-up and spin-down. The Dirac equation naturally incorporates this intrinsic angular momentum.",
    20,
    50,
  );

  const leftX = w / 3;
  const rightX = (w * 2) / 3;
  const centerY = h / 2;
  const radius = 80;

  // Spin-up visualization
  ctx.fillStyle = "#4da6ff";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Spin ↑", leftX, centerY - 120);

  // Sphere outline
  ctx.strokeStyle = "#4da6ff";
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(leftX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Spin arrow pointing up
  const upAngle = (frameCount * 0.05) % (Math.PI * 2);
  const upX = leftX + Math.sin(upAngle) * radius * 0.6;
  const upY = centerY - Math.cos(upAngle) * radius * 0.6;

  ctx.strokeStyle = "#4da6ff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(leftX, centerY);
  ctx.lineTo(upX, upY);
  ctx.stroke();

  ctx.fillStyle = "#4da6ff";
  ctx.beginPath();
  ctx.arc(upX, upY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Spin label
  ctx.fillStyle = "#4da6ff";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("↑ | 0⟩", leftX, centerY + 120);

  // Spin-down visualization
  ctx.fillStyle = "#ff6b9d";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Spin ↓", rightX, centerY - 120);

  // Sphere outline
  ctx.strokeStyle = "#ff6b9d";
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(rightX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Spin arrow pointing down
  const downAngle = (frameCount * 0.05) % (Math.PI * 2);
  const downX = rightX + Math.sin(downAngle) * radius * 0.6;
  const downY = centerY + Math.cos(downAngle) * radius * 0.6;

  ctx.strokeStyle = "#ff6b9d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(rightX, centerY);
  ctx.lineTo(downX, downY);
  ctx.stroke();

  ctx.fillStyle = "#ff6b9d";
  ctx.beginPath();
  ctx.arc(downX, downY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Spin label
  ctx.fillStyle = "#ff6b9d";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("↓ | 1⟩", rightX, centerY + 120);

  // Info box
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(20, h - 130, 400, 110);
  ctx.strokeRect(20, h - 130, 400, 110);

  ctx.fillStyle = "#aaa";
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Spin-½ Representation:", 30, h - 115);
  ctx.fillStyle = "#888";
  ctx.fillText("S_z = ±ℏ/2  (spin angular momentum)", 30, h - 100);
  ctx.fillText("Total angular momentum: J = L + S", 30, h - 85);
  ctx.fillText("Spinor wavefunction: ψ = (ψ↑, ψ↓)", 30, h - 70);

  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.fillText("Natural prediction of Dirac equation", 30, h - 50);
  ctx.fillText("Spin-½ is not due to classical rotation", 30, h - 35);
  ctx.fillText("Intrinsic quantum property", 30, h - 20);
}
