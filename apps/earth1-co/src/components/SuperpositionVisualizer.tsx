"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

/**
 * Superposition Visualizer showing:
 * - Qubit on Bloch sphere with superposition and measurement collapse
 * - Double-slit experiment with/without detector
 * - Wave superposition and interference patterns
 * Avoids "tries all answers at once" framing; emphasizes coherent superposition.
 */
export function SuperpositionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"bloch" | "double-slit" | "waves">("bloch");
  const [measurementMode, setMeasurementMode] = useState(false);
  const [hasDetector, setHasDetector] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

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
      setAnimationPhase(frameCount * 0.02);

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      if (mode === "bloch") {
        renderBloch(ctx, w, h, frameCount, measurementMode);
      } else if (mode === "double-slit") {
        renderDoubleSlit(ctx, w, h, frameCount, hasDetector);
      } else {
        renderWaves(ctx, w, h, frameCount);
      }
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => clearInterval(animationId);
  }, [mode, measurementMode, hasDetector]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspectRatio: "640 / 480" }}
        />
        <figcaption className="sr-only">
          Interactive superposition visualizer showing qubits, double-slit experiment, and
          wave interference.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`toggle ${mode === "bloch" ? "active" : ""}`}
            onClick={() => setMode("bloch")}
          >
            Bloch Sphere
          </button>
          <button
            type="button"
            className={`toggle ${mode === "double-slit" ? "active" : ""}`}
            onClick={() => setMode("double-slit")}
          >
            Double-Slit
          </button>
          <button
            type="button"
            className={`toggle ${mode === "waves" ? "active" : ""}`}
            onClick={() => setMode("waves")}
          >
            Wave Interference
          </button>
        </div>

        {mode === "bloch" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={measurementMode}
                onChange={(e) => setMeasurementMode(e.target.checked)}
              />
              <span className="text-sm">Measure (Collapse Superposition)</span>
            </label>
          </div>
        )}

        {mode === "double-slit" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasDetector}
                onChange={(e) => setHasDetector(e.target.checked)}
              />
              <span className="text-sm">Add Detector at Slit</span>
            </label>
          </div>
        )}

        <p className="source text-sm leading-relaxed">
          Superposition is a core quantum principle: a quantum system can exist in
          multiple states simultaneously until measured. A qubit on the Bloch sphere
          occupies a point in superposition; measurement collapses it to |0⟩ or |1⟩. The
          double-slit experiment shows wave-particle duality: without detection, particles
          behave like waves and interfere with themselves; with detection determining
          which slit they pass through, they behave like particles with no interference.
          Superposition isn't the system "trying all answers"—it's a coherent state where
          all possibilities coexist as a single quantum state until observation.
        </p>
      </div>
    </div>
  );
}

function renderBloch(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameCount: number,
  measurementMode: boolean,
) {
  const cx = w / 2;
  const cy = h / 2.2;
  const radius = 80;

  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Bloch Sphere: Qubit Superposition", 20, 30);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(
    "A qubit's state is a point on the Bloch sphere. Superposition is any point not at the poles. Measurement projects it to |0⟩ or |1⟩.",
    20,
    50,
  );

  // Draw Bloch sphere wireframe
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;

  // Equator
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Meridians
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI;
    ctx.beginPath();
    for (let j = 0; j <= 20; j++) {
      const lat = (j / 20) * Math.PI - Math.PI / 2;
      const x = cx + radius * Math.cos(lat) * Math.cos(angle);
      const y = cy + radius * Math.sin(lat);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - radius * 1.3, cy);
  ctx.lineTo(cx + radius * 1.3, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius * 1.3);
  ctx.lineTo(cx, cy + radius * 1.3);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = "#888";
  ctx.font = "11px sans-serif";
  ctx.fillText("|+⟩ X", cx + radius * 1.35, cy - 5);
  ctx.fillText("|0⟩ Z", cx - 15, cy - radius * 1.2);

  if (measurementMode) {
    // Collapsed state (random pole)
    const pole = Math.random() > 0.5;
    const stateX = cx;
    const stateY = pole ? cy - radius * 0.95 : cy + radius * 0.95;
    const label = pole ? "|0⟩" : "|1⟩";

    // Draw as sharp point at pole
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(stateX, stateY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffff00";
    ctx.font = "12px sans-serif";
    ctx.fillText(`Measured: ${label}`, stateX + 15, stateY + 5);

    // Draw measurement arrow
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(stateX, stateY);
    ctx.stroke();
  } else {
    // Superposition state (rotating around equator)
    const angle = frameCount * 0.03;
    const superpositionX = cx + radius * 0.8 * Math.cos(angle);
    const superpositionY = cy + radius * 0.8 * Math.sin(angle);

    // Draw as glowing sphere
    const gradient = ctx.createRadialGradient(
      superpositionX,
      superpositionY,
      0,
      superpositionX,
      superpositionY,
      8,
    );
    gradient.addColorStop(0, "rgba(100, 200, 255, 0.8)");
    gradient.addColorStop(1, "rgba(100, 200, 255, 0.2)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(superpositionX, superpositionY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Trajectory trail
    ctx.strokeStyle = "#4da6ff";
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // State vector
    ctx.strokeStyle = "#4da6ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(superpositionX, superpositionY);
    ctx.stroke();

    ctx.fillStyle = "#4da6ff";
    ctx.font = "12px sans-serif";
    ctx.fillText("Superposition: α|0⟩ + β|1⟩", superpositionX + 15, superpositionY - 5);
  }

  // Info box
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(20, h - 120, 280, 100);
  ctx.strokeRect(20, h - 120, 280, 100);

  ctx.fillStyle = "#aaa";
  ctx.font = "11px monospace";
  ctx.fillText("Qubit State:", 30, h - 105);
  ctx.fillStyle = "#888";
  ctx.fillText("|ψ⟩ = α|0⟩ + β|1⟩", 30, h - 90);
  ctx.fillText("|α|² + |β|² = 1", 30, h - 75);
  ctx.fillStyle = "#aaa";
  ctx.fillText("Measurement outcome:", 30, h - 55);
  ctx.fillStyle = "#888";
  ctx.fillText("|0⟩ with prob |α|²", 30, h - 40);
  ctx.fillText("|1⟩ with prob |β|²", 30, h - 25);
}

function renderDoubleSlit(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameCount: number,
  hasDetector: boolean,
) {
  const cx = w / 2;

  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Double-Slit Experiment: Wave-Particle Duality", 20, 30);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(
    hasDetector
      ? "With detector: particles detected, no interference pattern."
      : "Without detector: particles behave as waves, interfere with themselves.",
    20,
    50,
  );

  // Source
  ctx.fillStyle = "#ffff00";
  ctx.beginPath();
  ctx.arc(80, h / 2, 5, 0, Math.PI * 2);
  ctx.fill();

  // Slits
  const slitY1 = h / 2 - 40;
  const slitY2 = h / 2 + 40;
  const slitX = 250;

  ctx.fillStyle = "#444";
  ctx.fillRect(slitX - 2, slitY1 - 20, 4, 20);
  ctx.fillRect(slitX - 2, slitY2, 4, 20);

  if (hasDetector) {
    // Detector at slits
    ctx.strokeStyle = "#ff6b6b";
    ctx.lineWidth = 2;
    ctx.strokeRect(slitX - 30, slitY1 - 30, 60, 60);
    ctx.fillStyle = "#ff6b6b";
    ctx.font = "10px sans-serif";
    ctx.fillText("Detector", slitX - 22, slitY1 - 35);
  }

  // Wave propagation (if no detector)
  if (!hasDetector) {
    const waveRadius = 100 + (frameCount % 40) * 2;

    ctx.strokeStyle = "#4da6ff";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;

    // Waves from slit 1
    ctx.beginPath();
    ctx.arc(slitX, slitY1, waveRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Waves from slit 2
    ctx.beginPath();
    ctx.arc(slitX, slitY2, waveRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  // Detection screen
  const screenX = 650;
  ctx.fillStyle = "#333";
  ctx.fillRect(screenX - 2, 80, 4, h - 160);

  // Detection pattern
  if (hasDetector) {
    // Two bands (particles go through one slit or the other)
    ctx.fillStyle = "rgba(255, 100, 100, 0.3)";
    ctx.fillRect(screenX, slitY1 - 40, 60, 80);
    ctx.fillRect(screenX, slitY2 - 40, 60, 80);

    ctx.fillStyle = "#ff6b6b";
    ctx.font = "10px sans-serif";
    ctx.fillText("Particle pattern", screenX + 70, slitY1);
    ctx.fillText("(no interference)", screenX + 70, slitY2);
  } else {
    // Interference fringes
    for (let y = 100; y < h - 100; y += 3) {
      const dist1 = Math.abs(y - slitY1);
      const dist2 = Math.abs(y - slitY2);
      const pathDiff = Math.abs(dist1 - dist2);

      const interference = Math.cos(pathDiff * 0.05);
      const bright = Math.max(0, interference);

      ctx.fillStyle = `rgba(100, 200, 255, ${bright * 0.6})`;
      ctx.fillRect(screenX, y, 40, 3);
    }

    ctx.fillStyle = "#4da6ff";
    ctx.font = "10px sans-serif";
    ctx.fillText("Interference fringes", screenX + 50, h / 2);
    ctx.fillText("(wave behavior)", screenX + 50, h / 2 + 15);
  }
}

function renderWaves(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameCount: number,
) {
  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText(
    "Superposition of Waves: Constructive and Destructive Interference",
    20,
    30,
  );
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(
    "Two waves of equal frequency combine. Where they align (constructive), amplitude increases. Where opposite (destructive), they cancel.",
    20,
    50,
  );

  const startY = 120;
  const waveHeight = 30;
  const wavelength = 40;
  const phase = (frameCount * 0.05) % (Math.PI * 2);

  // Wave 1
  ctx.strokeStyle = "#ff6b9d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < w; x += 2) {
    const y = startY + Math.sin((x / wavelength) * Math.PI * 2 + phase) * waveHeight;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "#ff6b9d";
  ctx.font = "10px sans-serif";
  ctx.fillText("Wave A", 10, startY - 10);

  // Wave 2
  ctx.strokeStyle = "#4da6ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < w; x += 2) {
    const y =
      startY +
      80 +
      Math.sin((x / wavelength) * Math.PI * 2 + phase + Math.PI / 2) * waveHeight;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "#4da6ff";
  ctx.fillText("Wave B (90° phase shift)", 10, startY + 70);

  // Superposition (sum)
  ctx.strokeStyle = "#ffff00";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 0; x < w; x += 2) {
    const y1 = Math.sin((x / wavelength) * Math.PI * 2 + phase) * waveHeight;
    const y2 =
      Math.sin((x / wavelength) * Math.PI * 2 + phase + Math.PI / 2) * waveHeight;
    const y = startY + 160 + (y1 + y2);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "#ffff00";
  ctx.fillText("Superposition A + B (higher amplitude)", 10, startY + 150);

  // Amplitude diagram
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(20, h - 160, 380, 140);
  ctx.strokeRect(20, h - 160, 380, 140);

  ctx.fillStyle = "#aaa";
  ctx.font = "11px monospace";
  ctx.fillText("Superposition Principle:", 30, h - 140);
  ctx.fillStyle = "#888";
  ctx.fillText("ψ_total = ψ₁ + ψ₂", 30, h - 125);
  ctx.fillText("Constructive: waves aligned → amplitude increases", 30, h - 110);
  ctx.fillText("Destructive: waves opposite → amplitude decreases", 30, h - 95);
  ctx.fillText("Interference pattern depends on phase difference", 30, h - 80);
  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.fillText("Same principle applies to quantum wavefunctions", 30, h - 60);
}
