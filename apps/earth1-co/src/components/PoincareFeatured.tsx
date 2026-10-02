"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Poincaré Visualizer - Most Consequential Physicist
 * Showing:
 * - Poincaré group: spacetime symmetries (rotations, boosts, translations)
 * - Three-body chaos: sensitivity to initial conditions
 * - Poincaré section: tool for analyzing chaotic systems
 * Poincaré: relativity, chaos theory, and topology—a titan of 20th century physics
 */
export function PoincareFeatured() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"poincare-group" | "three-body" | "poincare-section">(
    "three-body"
  );

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

      if (mode === "poincare-group") {
        renderPoincarGroup(ctx, w, h, frameCount);
      } else if (mode === "three-body") {
        renderThreeBody(ctx, w, h, frameCount);
      } else {
        renderPoincarSection(ctx, w, h, frameCount);
      }
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => clearInterval(animationId);
  }, [mode]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspectRatio: "640 / 480" }}
        />
        <figcaption className="sr-only">
          Visualization of Poincaré's work: the Poincaré group, three-body chaos, and Poincaré sections.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`toggle ${mode === "poincare-group" ? "active" : ""}`}
            onClick={() => setMode("poincare-group")}
          >
            Poincaré Group
          </button>
          <button
            type="button"
            className={`toggle ${mode === "three-body" ? "active" : ""}`}
            onClick={() => setMode("three-body")}
          >
            Three-Body Chaos
          </button>
          <button
            type="button"
            className={`toggle ${mode === "poincare-section" ? "active" : ""}`}
            onClick={() => setMode("poincare-section")}
          >
            Poincaré Section
          </button>
        </div>

        <p className="source text-sm leading-relaxed">
          Henri Poincaré (1854–1912) was perhaps the most consequential mathematician-physicist
          of the 20th century. He developed special relativity symmetries (the Poincaré group),
          pioneered chaos theory through his work on the three-body problem, and founded modern
          topology. His insight that tiny differences in initial conditions lead to vastly
          different outcomes—sensitive dependence on initial conditions—revealed that
          deterministic systems can be unpredictable. This geometric view transformed how we
          understand dynamics.
        </p>
      </div>
    </div>
  );
}

function renderPoincarGroup(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameCount: number
) {
  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Poincaré Group: Spacetime Symmetries of Special Relativity", 20, 30);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText("The Poincaré group = Lorentz group + spacetime translations. It encodes all symmetries of special relativity.", 20, 50);

  const centerX = w / 2;
  const centerY = h / 2.2;
  const radius = 120;

  // Draw spacetime point
  ctx.fillStyle = "#ffff00";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffff00";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Event in spacetime", centerX, centerY - 25);

  // Draw transformations around it
  const transformations = [
    { name: "Rotation", angle: 0, color: "#4da6ff", desc: "Spatial rotation in 3D" },
    { name: "Boost", angle: Math.PI / 2, color: "#ff6b9d", desc: "Lorentz boost (v → c)" },
    { name: "Translation", angle: Math.PI, color: "#ffaa00", desc: "Spacetime shift" },
    { name: "Reflection", angle: (3 * Math.PI) / 2, color: "#4da6ff", desc: "Spatial reflection" },
  ];

  transformations.forEach((t) => {
    const x = centerX + radius * Math.cos(t.angle);
    const y = centerY + radius * Math.sin(t.angle);

    ctx.fillStyle = t.color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = t.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t.name, x, y + 3);

    // Arrows to center
    ctx.strokeStyle = t.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(centerX, centerY);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Info box
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(20, h - 150, w - 40, 130);
  ctx.strokeRect(20, h - 150, w - 40, 130);

  ctx.fillStyle = "#aaa";
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Poincaré Group = Lorentz Group ⋉ Spacetime Translations", 30, h - 130);
  ctx.fillStyle = "#888";
  ctx.fillText("Elements: (Λ, a) where Λ ∈ SO(1,3) and a ∈ ℝ⁴", 30, h - 115);
  ctx.fillText("Action: x ↦ Λx + a  (transform event coordinates)", 30, h - 100);

  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.fillText("• Lorentz group: rotations and boosts preserving spacetime interval", 30, h - 75);
  ctx.fillText("• Translations: uniform shifts in space and time", 30, h - 60);
  ctx.fillText("• Together: all continuous symmetries of special relativity", 30, h - 45);
  ctx.fillText("• Quantum field theory built on Poincaré invariance", 30, h - 30);
}

function renderThreeBody(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameCount: number
) {
  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Three-Body Problem: Chaos and Sensitivity to Initial Conditions", 20, 30);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(
    "Poincaré discovered that three gravitating bodies show chaotic behavior: tiny changes in position lead to completely different orbits.",
    20,
    50
  );

  const centerX = w / 2;
  const centerY = h / 2;

  // Two trajectories: one nominal, one slightly perturbed
  // We'll show simplified orbit paths
  const bodies1 = [
    { x: centerX - 100, y: centerY, color: "#4da6ff", name: "Body A" },
    { x: centerX + 100, y: centerY, color: "#ff6b9d", name: "Body B" },
    { x: centerX, y: centerY - 80, color: "#ffaa00", name: "Body C" },
  ];

  // Trajectories
  const trajectories: Record<number, Array<{ x: number; y: number }>> = {};
  for (let b = 0; b < 3; b++) {
    trajectories[b] = [];
    for (let t = 0; t <= frameCount; t += 2) {
      const angle = (t * 0.02 + b * (Math.PI * 2) / 3) % (Math.PI * 2);
      const r = 50 + b * 30;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      trajectories[b].push({ x, y });
    }
  }

  // Draw trajectories (chaotic-looking)
  for (let b = 0; b < 3; b++) {
    ctx.strokeStyle = bodies1[b].color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();

    trajectories[b].forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Draw current positions
  bodies1.forEach((body, i) => {
    const t = frameCount * 0.02 + i * (Math.PI * 2) / 3;
    const r = 50 + i * 30;
    const x = centerX + r * Math.cos(t);
    const y = centerY + r * Math.sin(t);

    ctx.fillStyle = body.color;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = body.color;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(body.name, x, y - 15);
  });

  // Sensitivity info
  const sensitivityPhase = (frameCount * 0.03) % 1;

  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#ff6b9d";
  ctx.lineWidth = 1 + sensitivityPhase * 2;
  ctx.fillRect(20, 240, 300, 100);
  ctx.strokeRect(20, 240, 300, 100);

  ctx.fillStyle = "#ff6b9d";
  ctx.font = "11px bold";
  ctx.textAlign = "left";
  ctx.fillText("Initial Perturbation", 30, 260);

  ctx.fillStyle = "#888";
  ctx.font = "10px sans-serif";
  ctx.fillText("Δx ≈ 10⁻⁶ m (tiny!)", 30, 280);
  ctx.fillText("Time → ∞", 30, 300);
  ctx.fillText("Δx → vastly different", 30, 320);

  // Info box
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(w - 320, 240, 300, 100);
  ctx.strokeRect(w - 320, 240, 300, 100);

  ctx.fillStyle = "#aaa";
  ctx.font = "11px bold";
  ctx.textAlign = "left";
  ctx.fillText("Lyapunov Exponent λ > 0", w - 310, 260);

  ctx.fillStyle = "#888";
  ctx.font = "10px sans-serif";
  ctx.fillText("Δ(t) ≈ Δ(0) × e^(λt)", w - 310, 280);
  ctx.fillText("Chaos: deterministic but", w - 310, 300);
  ctx.fillText("unpredictable long-term", w - 310, 320);

  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(20, h - 140, w - 40, 120);
  ctx.strokeRect(20, h - 140, w - 40, 120);

  ctx.fillStyle = "#aaa";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Three bodies under mutual gravity: no closed-form solution", 30, h - 120);
  ctx.fillText("Poincaré's insight: some systems are deterministic yet unpredictable", 30, h - 100);

  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.fillText("• Sensitive dependence on initial conditions: hallmark of chaos", 30, h - 75);
  ctx.fillText("• Butterfly effect: small perturbations → large divergence", 30, h - 60);
  ctx.fillText("• Despite determinism (Newton's laws), long-term prediction is impossible", 30, h - 45);
}

function renderPoincarSection(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameCount: number
) {
  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Poincaré Section: Visualizing Chaos in Phase Space", 20, 30);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(
    "A tool for analyzing chaotic systems: plot where orbits cross a 2D surface in phase space.",
    20,
    50
  );

  const plotX = 80;
  const plotY = 100;
  const plotW = w - 160;
  const plotH = 200;

  // Draw axes
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(plotX, plotY + plotH);
  ctx.lineTo(plotX + plotW, plotY + plotH);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(plotX, plotY);
  ctx.lineTo(plotX, plotY + plotH);
  ctx.stroke();

  // Labels
  ctx.fillStyle = "#aaa";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Position (x)", plotX + plotW / 2, plotY + plotH + 25);

  ctx.save();
  ctx.translate(plotX - 30, plotY + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Momentum (p)", 0, 0);
  ctx.restore();

  // Generate chaotic points (simplified Poincaré map)
  const numOrbitals = 50;
  const pointsPerOrbital = 30;

  for (let orbit = 0; orbit < numOrbitals; orbit++) {
    // Start from different initial condition
    const x0 = 0.2 + (orbit / numOrbitals) * 0.6;
    const p0 = 0.3 + (orbit / numOrbitals) * 0.4;

    for (let i = 0; i < pointsPerOrbital; i++) {
      // Simplified chaotic map (logistic map in 2D)
      let x = x0;
      let p = p0;

      for (let j = 0; j <= i; j++) {
        const theta = (x * Math.PI * 2 + j * 0.1 + frameCount * 0.01) % (Math.PI * 2);
        x = (3.8 * x * (1 - x) + 0.1 * Math.sin(theta)) % 1;
        p = (3.8 * p * (1 - p) + 0.1 * Math.cos(theta)) % 1;
      }

      const pixelX = plotX + x * plotW;
      const pixelY = plotY + (1 - p) * plotH;

      // Color based on orbit index for visualization
      const hue = (orbit / numOrbitals) * 360;
      ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(pixelX, pixelY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Info box
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(20, plotY + plotH + 50, w - 40, 150);
  ctx.strokeRect(20, plotY + plotH + 50, w - 40, 150);

  ctx.fillStyle = "#aaa";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Poincaré Section Analysis:", 30, plotY + plotH + 70);
  ctx.fillStyle = "#888";
  ctx.fillText(
    "Instead of plotting entire orbits in phase space, track where they cross a 2D surface.",
    30,
    plotY + plotH + 85
  );
  ctx.fillText("Chaotic systems show fractal patterns in Poincaré sections (strange attractors).",
    30,
    plotY + plotH + 100);
  ctx.fillText(
    "Periodic orbits appear as points, chaotic orbits fill regions densely.",
    30,
    plotY + plotH + 115
  );

  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.fillText("• Poincaré invented this section method to study dynamics", 30, plotY + plotH + 135);
  ctx.fillText("• Reduces infinite 3D trajectories to discrete 2D maps", 30, plotY + plotH + 150);
  ctx.fillText("• Reveals underlying structure of chaotic systems", 30, plotY + plotH + 165);
}
