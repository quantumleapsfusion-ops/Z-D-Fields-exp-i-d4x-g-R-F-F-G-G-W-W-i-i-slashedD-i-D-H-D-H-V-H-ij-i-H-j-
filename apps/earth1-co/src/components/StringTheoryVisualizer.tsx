"use client";

import { useEffect, useRef, useState } from "react";

interface StringMode {
  harmonic: number; // which harmonic (1, 2, 3, ...)
  amplitude: number; // current amplitude
  phase: number; // phase offset for animation
  color: string;
  particleName: string;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

/**
 * String Theory Visualizer showing:
 * - Vibrating strings with different modes
 * - How modes correspond to particles
 * - Compact extra dimensions as compactified spaces
 */
export function StringTheoryVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedMode, setSelectedMode] = useState(1);
  const [showExtraDimensions, setShowExtraDimensions] = useState(true);
  const [timeScale, setTimeScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reduce motion preference
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animSpeed = reduceMotion ? 0.1 : 1;

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // String modes: harmonic number -> particle representation
    const modes: StringMode[] = [
      {
        harmonic: 1,
        amplitude: 1,
        phase: 0,
        color: "#ff6b9d",
        particleName: "Photon (massless)",
      },
      {
        harmonic: 2,
        amplitude: 0.8,
        phase: 0,
        color: "#c44569",
        particleName: "W Boson",
      },
      {
        harmonic: 3,
        amplitude: 0.6,
        phase: 0,
        color: "#a23b72",
        particleName: "Z Boson",
      },
      {
        harmonic: 4,
        amplitude: 0.4,
        phase: 0,
        color: "#7f2e54",
        particleName: "Higgs-like",
      },
    ];

    let time = 0;
    let frameCount = 0;

    const drawString = (
      startX: number,
      startY: number,
      width: number,
      height: number,
      mode: StringMode,
      alpha: number,
    ) => {
      const points = 200;
      ctx.beginPath();

      for (let i = 0; i < points; i++) {
        const x = startX + (i / points) * width;
        // Standing wave: sin(n*pi*x/L) * cos(omega*t)
        const standingWave = Math.sin((mode.harmonic * Math.PI * i) / points);
        const oscillation =
          Math.cos((mode.phase + time * 2) * mode.harmonic) * mode.amplitude;
        const y = startY + height / 2 + standingWave * oscillation * (height / 3);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = mode.color;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const render = () => {
      if (!reduceMotion) {
        time += 0.05 * animSpeed * timeScale;
        frameCount += 1;
      }

      // Clear background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      // Title and description
      ctx.fillStyle = "#fff";
      ctx.font = "16px sans-serif";
      ctx.fillText("String Theory: Vibrating Strings as Particles", 20, 30);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#888";
      ctx.fillText(
        "Different vibrational modes of the same fundamental string produce different particles. All matter and forces are strings vibrating in 10 or 11 dimensions.",
        20,
        50,
      );

      // Draw all string modes
      const modeSpacing = (w - 40) / modes.length;
      modes.forEach((mode, idx) => {
        const x = 20 + idx * modeSpacing;
        const isSelected = idx + 1 === selectedMode;
        const alpha = isSelected ? 1 : 0.4;

        // String visualization
        drawString(x, 100, modeSpacing - 10, 120, mode, alpha);

        // Mode label
        ctx.fillStyle = isSelected ? mode.color : "#666";
        ctx.font = isSelected ? "bold 12px sans-serif" : "12px sans-serif";
        ctx.fillText(`n=${mode.harmonic}`, x + 10, 240);
        ctx.fillStyle = isSelected ? "#fff" : "#888";
        ctx.fillText(mode.particleName, x + 10, 255);
      });

      // Extra dimensions visualization
      if (showExtraDimensions) {
        ctx.fillStyle = "#fff";
        ctx.font = "14px sans-serif";
        ctx.fillText("Compact Extra Dimensions", 20, 310);

        // Draw Calabi-Yau-like shape (simplified torus cross-section)
        const torusX = 150;
        const torusY = 360;
        const majorRadius = 60;
        const minorRadius = 20;

        ctx.strokeStyle = "#4da6ff";
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;

        // Draw multiple circles to suggest 3D compactified space
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const x = torusX + Math.cos(angle) * majorRadius;
          const y = torusY + Math.sin(angle) * majorRadius * 0.5;

          ctx.beginPath();
          ctx.arc(
            x,
            y,
            minorRadius * (0.5 + 0.5 * Math.cos(time + angle)),
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }

        ctx.globalAlpha = 1;

        // Label
        ctx.fillStyle = "#aaa";
        ctx.font = "11px sans-serif";
        ctx.fillText("6 compact dimensions (10D spacetime)", torusX + 100, torusY + 20);
        ctx.fillText("curled up at Planck scale (~10⁻³⁵m)", torusX + 100, torusY + 35);
      }

      // Higher energy -> higher modes
      ctx.fillStyle = "#999";
      ctx.font = "12px monospace";
      ctx.fillText("Energy increases with mode number n", 20, h - 30);
      ctx.fillText("Higher modes have more compact structure", 20, h - 15);
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => {
      clearInterval(animationId);
    };
  }, [selectedMode, showExtraDimensions, timeScale]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspectRatio: "640 / 480" }}
        />
        <figcaption className="sr-only">
          Interactive string theory visualizer showing vibrating strings and their
          particle interpretations.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`toggle ${selectedMode === mode ? "active" : ""}`}
              onClick={() => setSelectedMode(mode)}
            >
              Mode {mode}
            </button>
          ))}
          <button
            type="button"
            className={`toggle ${showExtraDimensions ? "active" : ""}`}
            onClick={() => setShowExtraDimensions(!showExtraDimensions)}
          >
            Extra Dimensions
          </button>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <span className="text-sm">Speed:</span>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={timeScale}
              onChange={(e) => setTimeScale(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm">{timeScale.toFixed(1)}×</span>
          </label>
        </div>

        <p className="source text-sm leading-relaxed">
          String theory proposes that all fundamental particles are tiny vibrating
          strings. Different vibrational modes produce different particles: the lowest
          mode gives massless photons, higher modes give massive W and Z bosons, and even
          higher modes could produce gravity and other forces. The theory requires 10 or
          11 total dimensions—the 4 we observe (3 space + 1 time) plus 6 or 7 others,
          compactified at the Planck scale and invisible to us.
        </p>
      </div>
    </div>
  );
}
