"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Schrödinger Equation Visualizer showing:
 * - Time-dependent wavefunction evolution in a potential well
 * - Standing wave patterns as energy eigenstates
 * - Probability density as |ψ|²
 * - Energy quantization in confined systems
 */
export function SchrodingerEquation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [energyLevel, setEnergyLevel] = useState(1);
  const [showProbability, setShowProbability] = useState(true);
  const [animate, setAnimate] = useState(true);

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

      renderSchrodinger(ctx, w, h, frameCount, energyLevel, showProbability, animate);
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => clearInterval(animationId);
  }, [energyLevel, showProbability, animate]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspectRatio: "640 / 480" }}
        />
        <figcaption className="sr-only">
          Visualization of the Schrödinger equation showing wavefunction evolution in a potential well.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <span className="text-sm">Energy level (n):</span>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm">n = {energyLevel}</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showProbability}
              onChange={(e) => setShowProbability(e.target.checked)}
              className="rounded border-gray-600"
            />
            <span className="text-sm">Show probability density |ψ|²</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={animate}
              onChange={(e) => setAnimate(e.target.checked)}
              className="rounded border-gray-600"
            />
            <span className="text-sm">Animate</span>
          </label>
        </div>

        <p className="source text-sm leading-relaxed">
          The Schrödinger equation (iℏ∂ψ/∂t = Hψ) governs quantum dynamics. In a potential
          well, the wavefunction ψ(x,t) forms standing waves whose wavelengths fit precisely
          into the box. Only certain energies are allowed—this is quantization. The probability
          of finding a particle at position x is |ψ(x)|². Bound states oscillate in time but
          maintain constant probability density: they are stationary states (energy eigenstates).
        </p>
      </div>
    </div>
  );
}

function renderSchrodinger(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameCount: number,
  energyLevel: number,
  showProbability: boolean,
  animate: boolean
) {
  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Schrödinger Equation: Particle in a Box", 20, 30);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(
    "Wavefunction ψ(x,t) and probability density |ψ(x)|² for a particle confined in a box with infinite potential walls.",
    20,
    50
  );

  const wellLeft = 100;
  const wellRight = w - 100;
  const wellTop = 120;
  const wellBottom = 280;
  const wellWidth = wellRight - wellLeft;
  const wellHeight = wellBottom - wellTop;

  // Draw potential well
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(wellLeft, wellTop);
  ctx.lineTo(wellLeft, wellBottom);
  ctx.lineTo(wellRight, wellBottom);
  ctx.lineTo(wellRight, wellTop);
  ctx.stroke();

  ctx.fillStyle = "rgba(50, 100, 150, 0.1)";
  ctx.fillRect(wellLeft, wellTop, wellWidth, wellHeight);

  // Draw wavefunction
  const phase = animate ? (frameCount * 0.05) % (Math.PI * 2) : 0;
  const color = "#4da6ff";

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let x = wellLeft; x <= wellRight; x += 1) {
    const xNorm = (x - wellLeft) / wellWidth;
    // Standing wave: ψ_n(x) ~ sin(nπx/L)
    const waveValue = Math.sin((energyLevel * Math.PI * xNorm) / 1);
    // Time evolution: multiply by e^{-iEt/ℏ}
    const timePhase = animate ? Math.cos(phase * energyLevel * 0.5) : 1;
    const psi = waveValue * timePhase;

    const y = wellBottom - (psi * wellHeight * 0.3 + wellHeight * 0.5);

    if (x === wellLeft) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw probability density if enabled
  if (showProbability) {
    ctx.fillStyle = "rgba(77, 166, 255, 0.3)";

    ctx.beginPath();
    ctx.moveTo(wellLeft, wellBottom);

    for (let x = wellLeft; x <= wellRight; x += 1) {
      const xNorm = (x - wellLeft) / wellWidth;
      const waveValue = Math.sin((energyLevel * Math.PI * xNorm) / 1);
      const probability = waveValue * waveValue;

      const y = wellBottom - probability * wellHeight * 0.6;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(wellRight, wellBottom);
    ctx.closePath();
    ctx.fill();
  }

  // Draw energy level indicator
  const energyY = wellTop - 30;
  ctx.fillStyle = "#ffaa00";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`E_${energyLevel} = ${energyLevel}² × (ℏ²π²/2mL²)`, wellLeft - 10, energyY);

  ctx.strokeStyle = "#ffaa00";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(wellLeft - 20, energyY - 10);
  ctx.lineTo(wellLeft, energyY - 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw energy diagram on the right
  const diagX = wellRight + 40;
  const diagY = wellTop;
  const diagHeight = wellHeight;

  ctx.fillStyle = "#444";
  ctx.fillRect(diagX, diagY, 80, diagHeight);
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  ctx.strokeRect(diagX, diagY, 80, diagHeight);

  // Draw energy levels
  for (let n = 1; n <= 5; n++) {
    const levelY = diagY + diagHeight - (n * n * (diagHeight / 25));
    if (levelY > diagY) {
      const isSelected = n === energyLevel;
      ctx.strokeStyle = isSelected ? "#4da6ff" : "#666";
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(diagX, levelY);
      ctx.lineTo(diagX + 80, levelY);
      ctx.stroke();

      ctx.fillStyle = isSelected ? "#4da6ff" : "#888";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`n=${n}`, diagX + 40, levelY + 3);
    }
  }

  ctx.fillStyle = "#aaa";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Energy", diagX + 40, diagY - 10);

  // Info box
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(20, h - 160, w - 40, 140);
  ctx.strokeRect(20, h - 160, w - 40, 140);

  ctx.fillStyle = "#aaa";
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Time-dependent Schrödinger Equation:", 30, h - 140);
  ctx.fillStyle = "#888";
  ctx.fillText("iℏ ∂ψ/∂t = -ℏ²/2m ∇²ψ + Vψ  (or Hψ = iℏ ∂ψ/∂t)", 30, h - 125);
  ctx.fillText(
    `For particle in box: E_n = n²ℏ²π²/(2mL²),  ψ_n(x) ~ sin(nπx/L)`,
    30,
    h - 110
  );

  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.fillText("• Only discrete energies are allowed (quantization)", 30, h - 85);
  ctx.fillText("• Higher n = shorter wavelength = higher kinetic energy", 30, h - 70);
  ctx.fillText("• |ψ|² tells probability density—not a real wave, but a matter wave", 30, h - 55);
  ctx.fillText("• Eigenstates don't change shape over time, only oscillate in phase", 30, h - 40);
}
