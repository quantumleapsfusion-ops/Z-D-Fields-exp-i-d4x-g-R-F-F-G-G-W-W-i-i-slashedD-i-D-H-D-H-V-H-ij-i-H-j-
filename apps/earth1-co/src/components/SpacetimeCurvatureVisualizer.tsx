"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

/**
 * Spacetime Curvature Visualizer showing:
 * - Flat spacetime grid with no mass
 * - Massive object curving spacetime
 * - How gravity emerges as geometry
 */
export function SpacetimeCurvatureVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showMass, setShowMass] = useState(true);
  const [massStrength, setMassStrength] = useState(1);
  const [showGeodesics, setShowGeodesics] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;

    const gridSpacing = 30;
    const gridLines = 15;

    let frameCount = 0;

    const render = () => {
      frameCount += 1;

      // Clear background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      // Title
      ctx.fillStyle = "#fff";
      ctx.font = "16px sans-serif";
      ctx.fillText("Spacetime Curvature: Gravity as Geometry", 20, 30);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#888";
      ctx.fillText(
        "Mass warps spacetime. Objects follow geodesics (straightest paths) through curved spacetime.",
        20,
        50,
      );

      // Draw spacetime grid
      ctx.strokeStyle = showMass ? "#333" : "#555";
      ctx.lineWidth = 1;

      for (let i = -gridLines; i <= gridLines; i++) {
        // Horizontal lines (time)
        if (showMass) {
          ctx.beginPath();
          for (let j = -gridLines; j <= gridLines; j++) {
            const x = cx + j * gridSpacing;
            const y = cy + i * gridSpacing;
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            const curvature = Math.exp(-dist / 100) * massStrength;
            const dy = curvature * 15;

            if (j === -gridLines) ctx.moveTo(x, y + dy);
            else ctx.lineTo(x, y + dy);
          }
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(cx - gridLines * gridSpacing, cy + i * gridSpacing);
          ctx.lineTo(cx + gridLines * gridSpacing, cy + i * gridSpacing);
          ctx.stroke();
        }

        // Vertical lines (space)
        if (showMass) {
          ctx.beginPath();
          for (let j = -gridLines; j <= gridLines; j++) {
            const x = cx + i * gridSpacing;
            const y = cy + j * gridSpacing;
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            const curvature = Math.exp(-dist / 100) * massStrength;
            const dx = curvature * 15;

            if (j === -gridLines) ctx.moveTo(x + dx, y);
            else ctx.lineTo(x + dx, y);
          }
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(cx + i * gridSpacing, cy - gridLines * gridSpacing);
          ctx.lineTo(cx + i * gridSpacing, cy + gridLines * gridSpacing);
          ctx.stroke();
        }
      }

      // Draw massive object (if visible)
      if (showMass) {
        const massRadius = 30 + massStrength * 10;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, massRadius);
        gradient.addColorStop(0, "rgba(200, 100, 50, 0.8)");
        gradient.addColorStop(1, "rgba(100, 50, 20, 0.3)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, massRadius, 0, Math.PI * 2);
        ctx.fill();

        // Mass label
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Mass", cx, cy - 5);
        ctx.fillText("Curves Space", cx, cy + 10);
        ctx.textAlign = "left";
      }

      // Draw geodesics (straight paths in curved spacetime)
      if (showGeodesics && showMass) {
        ctx.strokeStyle = "#4da6ff";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;

        // Radial geodesics
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
          ctx.beginPath();
          const startX = cx + Math.cos(angle) * (gridLines * gridSpacing * 0.8);
          const startY = cy + Math.sin(angle) * (gridLines * gridSpacing * 0.8);

          for (let r = 0; r <= gridLines * gridSpacing * 0.8; r += 5) {
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

            // Bend toward mass due to curved spacetime
            const curvature = (1 - Math.exp(-dist / 150)) * massStrength * 0.5;
            const perpX = -Math.sin(angle) * curvature;
            const perpY = Math.cos(angle) * curvature;

            if (r === 0) ctx.moveTo(x + perpX, y + perpY);
            else ctx.lineTo(x + perpX, y + perpY);
          }
          ctx.stroke();
        }

        ctx.globalAlpha = 1;

        // Geodesic label
        ctx.fillStyle = "#4da6ff";
        ctx.font = "11px sans-serif";
        ctx.fillText(
          "Geodesics (straight paths in curved spacetime)",
          cx + 80,
          cy + gridLines * gridSpacing - 10,
        );
      }

      // Info box
      ctx.fillStyle = "#111";
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.fillRect(20, h - 120, 280, 100);
      ctx.strokeRect(20, h - 120, 280, 100);

      ctx.fillStyle = "#aaa";
      ctx.font = "11px monospace";
      ctx.fillText("General Relativity (Einstein):", 30, h - 105);
      ctx.fillStyle = "#888";
      ctx.fillText("g_{μν}:  metric tensor (curvature)", 30, h - 90);
      ctx.fillText("T_{μν}:  stress-energy tensor (matter)", 30, h - 75);
      ctx.fillText("G_{μν} = 8πT_{μν}  (with c=G=1)", 30, h - 60);
      ctx.fillStyle = "#666";
      ctx.font = "10px sans-serif";
      ctx.fillText("Matter tells spacetime how to curve.", 30, h - 40);
      ctx.fillText("Spacetime tells matter how to move.", 30, h - 25);
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => {
      clearInterval(animationId);
    };
  }, [showMass, massStrength, showGeodesics]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspectRatio: "640 / 480" }}
        />
        <figcaption className="sr-only">
          Visualization of spacetime curvature caused by mass, showing how gravity emerges
          as geometry.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`toggle ${showMass ? "active" : ""}`}
            onClick={() => setShowMass(!showMass)}
          >
            {showMass ? "Hide" : "Show"} Mass
          </button>
          <button
            type="button"
            className={`toggle ${showGeodesics ? "active" : ""}`}
            onClick={() => setShowGeodesics(!showGeodesics)}
            disabled={!showMass}
          >
            Geodesics
          </button>
        </div>

        {showMass && (
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <span className="text-sm">Mass Strength:</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={massStrength}
                onChange={(e) => setMassStrength(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm">{massStrength.toFixed(1)}×</span>
            </label>
          </div>
        )}

        <p className="source text-sm leading-relaxed">
          Einstein&apos;s general relativity reveals that gravity is not a force but the
          geometry of spacetime itself. A massive object curves the spacetime around
          it—think of it as warping a rubber sheet. Other objects naturally follow
          geodesics (the straightest available paths) through this curved spacetime, which
          we perceive as gravitational attraction. The famous equation G<sub>μν</sub> =
          8πT<sub>μν</sub> (in natural units) relates the curvature of spacetime to the
          distribution of matter and energy. This unified view of gravity as geometry is
          one of the most elegant insights in physics.
        </p>
      </div>
    </div>
  );
}
