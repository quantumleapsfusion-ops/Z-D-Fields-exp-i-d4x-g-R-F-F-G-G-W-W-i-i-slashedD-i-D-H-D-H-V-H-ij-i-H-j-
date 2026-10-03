"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pauli Matrices and Exclusion Principle Visualizer showing:
 * - The three Pauli matrices (σ_x, σ_y, σ_z) and their action on spin states
 * - Quantum state space and basis transformations
 * - Pauli exclusion principle: why two fermions cannot occupy the same state
 */
export function PauliMatrices() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"matrices" | "exclusion">("matrices");
  const [selectedMatrix, setSelectedMatrix] = useState<"x" | "y" | "z">("z");
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

      if (mode === "matrices") {
        renderMatrices(ctx, w, h, frameCount, selectedMatrix);
      } else {
        renderExclusion(ctx, w, h, frameCount);
      }
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => clearInterval(animationId);
  }, [mode, selectedMatrix]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspectRatio: "640 / 480" }}
        />
        <figcaption className="sr-only">
          Visualization of Pauli matrices and the Pauli exclusion principle.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`toggle ${mode === "matrices" ? "active" : ""}`}
            onClick={() => setMode("matrices")}
          >
            Pauli Matrices
          </button>
          <button
            type="button"
            className={`toggle ${mode === "exclusion" ? "active" : ""}`}
            onClick={() => setMode("exclusion")}
          >
            Exclusion Principle
          </button>
        </div>

        {mode === "matrices" && (
          <div className="space-y-2">
            <label className="text-sm">
              Select matrix:
              <div className="flex gap-2 mt-1">
                {(["x", "y", "z"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`px-2 py-1 text-xs border rounded ${
                      selectedMatrix === m
                        ? "border-white bg-white/20"
                        : "border-white/30 hover:border-white/50"
                    }`}
                    onClick={() => setSelectedMatrix(m)}
                  >
                    σ_{m}
                  </button>
                ))}
              </div>
            </label>
          </div>
        )}

        <p className="source text-sm leading-relaxed">
          {mode === "matrices"
            ? "The Pauli matrices σ_x, σ_y, σ_z form the generators of SU(2) rotations and represent spin operators. Each matrix acts on a two-component spinor, rotating or measuring spin in different directions. Together with the identity, they form a basis for all 2×2 Hermitian matrices and are fundamental to quantum computing and quantum mechanics."
            : "The Pauli exclusion principle states that no two identical fermions can occupy the same quantum state. This follows from the antisymmetry of fermionic wavefunctions: exchanging two fermions introduces a minus sign. If two fermions were in the same state, exchange would leave the wavefunction unchanged, contradicting antisymmetry. This principle explains atomic structure, chemical bonding, and the stability of matter itself."}
        </p>
      </div>
    </div>
  );
}

function renderMatrices(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameCount: number,
  selectedMatrix: "x" | "y" | "z"
) {
  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Pauli Matrices: Generators of Spin Rotations", 20, 30);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(
    "The Pauli matrices σ_x, σ_y, σ_z represent spin measurements and rotations in quantum mechanics.",
    20,
    50
  );

  const centerX = w / 2;
  const centerY = 150;

  // Display all three matrices
  const matrices: Record<"x" | "y" | "z", string[]> = {
    x: ["0", "1", "1", "0"],
    y: ["0", "-i", "i", "0"],
    z: ["1", "0", "0", "-1"],
  };

  const colors = { x: "#4da6ff", y: "#ffaa00", z: "#ff6b9d" };
  const positions = {
    x: 120,
    y: centerX,
    z: centerX + 260,
  };

  for (const [label, pos] of Object.entries(positions)) {
    const isSelected = label === selectedMatrix;
    const color = colors[label as "x" | "y" | "z"];

    ctx.fillStyle = isSelected ? color : "#555";
    ctx.font = isSelected ? "bold 13px sans-serif" : "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`σ_${label}`, pos, centerY - 40);

    // Draw matrix box
    const boxW = 80;
    const boxH = 80;
    const boxX = pos - boxW / 2;
    const boxY = centerY;

    ctx.strokeStyle = isSelected ? color : "#444";
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    const matrix = matrices[label as "x" | "y" | "z"];
    ctx.fillStyle = isSelected ? color : "#888";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";

    // Matrix entries
    ctx.fillText(matrix[0], pos - 15, centerY + 20);
    ctx.fillText(matrix[1], pos + 15, centerY + 20);
    ctx.fillText(matrix[2], pos - 15, centerY + 45);
    ctx.fillText(matrix[3], pos + 15, centerY + 45);

    // Eigenvalues
    const eigenvalues: Record<"x" | "y" | "z", string> = {
      x: "±1",
      y: "±1",
      z: "±1",
    };

    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.fillText(`λ = ${eigenvalues[label as "x" | "y" | "z"]}`, pos, centerY + 110);
  }

  // Detailed view of selected matrix
  const detailY = 300;
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(20, detailY, w - 40, h - detailY - 20);
  ctx.strokeRect(20, detailY, w - 40, h - detailY - 20);

  ctx.fillStyle = "#aaa";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Selected: σ_${selectedMatrix}`, 30, detailY + 25);

  const details: Record<"x" | "y" | "z", string[]> = {
    x: [
      "σ_x = [[0, 1], [1, 0]]",
      "Eigenvalues: +1, -1",
      "Eigenstates: |+⟩ = (1, 1)/√2 (spin right), |-⟩ = (1, -1)/√2 (spin left)",
      "Action: rotates spin around x-axis",
      "Commutation: [σ_x, σ_y] = 2iσ_z",
    ],
    y: [
      "σ_y = [[0, -i], [i, 0]]",
      "Eigenvalues: +1, -1",
      "Eigenstates: |+⟩ = (1, i)/√2 (spin forward), |-⟩ = (1, -i)/√2 (spin backward)",
      "Action: rotates spin around y-axis",
      "Commutation: [σ_y, σ_z] = 2iσ_x",
    ],
    z: [
      "σ_z = [[1, 0], [0, -1]]",
      "Eigenvalues: +1, -1",
      "Eigenstates: |0⟩ = (1, 0) (spin up), |1⟩ = (0, 1) (spin down)",
      "Action: measures spin along z-axis",
      "Commutation: [σ_z, σ_x] = 2iσ_y",
    ],
  };

  ctx.fillStyle = "#888";
  ctx.font = "10px monospace";
  const lines = details[selectedMatrix];
  lines.forEach((line, i) => {
    ctx.fillText(line, 30, detailY + 50 + i * 20);
  });

  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.fillText("• All Pauli matrices are Hermitian (σ† = σ) and unitary (σ² = I)", 30, h - 45);
  ctx.fillText("• Together with identity I, they form basis for 2×2 Hermitian matrices", 30, h - 30);
  ctx.fillText(
    "• Spin-½ particles have eigenstates ±1/2 with respect to spin operators ±ℏσ/2",
    30,
    h - 15
  );
}

function renderExclusion(ctx: CanvasRenderingContext2D, w: number, h: number, frameCount: number) {
  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Pauli Exclusion Principle: No Two Identical Fermions in Same State", 20, 30);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(
    "Fermions have antisymmetric wavefunctions: ψ(2,1) = -ψ(1,2). If both fermions are in the same state, the wavefunction must vanish.",
    20,
    50
  );

  const leftX = w / 3;
  const rightX = (w * 2) / 3;
  const topY = 120;

  // Left side: allowed state (different states)
  ctx.fillStyle = "#4da6ff";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Allowed: Different States", leftX, topY);

  // Draw two electrons in different states
  const electronRadius = 25;
  const separation = 80;

  // Electron 1: spin up
  ctx.fillStyle = "#4da6ff";
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(leftX - separation / 2, topY + 60, electronRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "#4da6ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(leftX - separation / 2, topY + 60, electronRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#4da6ff";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("↑", leftX - separation / 2, topY + 65);
  ctx.fillText("n=1, l=0, m_l=0", leftX - separation / 2, topY + 130);

  // Electron 2: spin down
  ctx.fillStyle = "#ffaa00";
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(leftX + separation / 2, topY + 60, electronRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "#ffaa00";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(leftX + separation / 2, topY + 60, electronRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#ffaa00";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("↓", leftX + separation / 2, topY + 65);
  ctx.fillText("n=1, l=0, m_l=0", leftX + separation / 2, topY + 130);

  ctx.fillStyle = "#4da6ff";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Antisymmetric wavefunction:", leftX, topY + 160);
  ctx.fillText("ψ(1,2) = -ψ(2,1) ✓", leftX, topY + 175);

  // Right side: forbidden state (same state)
  ctx.fillStyle = "#ff6b9d";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Forbidden: Same State", rightX, topY);

  // Draw two electrons trying to be in same state
  const phase = (Math.sin(frameCount * 0.05) + 1) / 2;

  // Electron 1: spin up
  ctx.fillStyle = "#ff6b9d";
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(rightX - separation / 2 + phase * 30, topY + 60, electronRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "#ff6b9d";
  ctx.lineWidth = 2;
  ctx.globalAlpha = 1 - phase;
  ctx.beginPath();
  ctx.arc(rightX - separation / 2 + phase * 30, topY + 60, electronRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#ff6b9d";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("↑", rightX - separation / 2 + phase * 30, topY + 65);

  // Electron 2: spin up
  ctx.fillStyle = "#ff6b9d";
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(rightX + separation / 2 - phase * 30, topY + 60, electronRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "#ff6b9d";
  ctx.lineWidth = 2;
  ctx.globalAlpha = 1 - phase;
  ctx.beginPath();
  ctx.arc(rightX + separation / 2 - phase * 30, topY + 60, electronRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#ff6b9d";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("↑", rightX + separation / 2 - phase * 30, topY + 65);
  ctx.fillText("n=1, l=0, m_l=0", rightX + separation / 2, topY + 130);

  ctx.fillStyle = "#ff6b9d";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Symmetric wavefunction:", rightX, topY + 160);
  ctx.fillText("ψ(1,2) = ψ(2,1)  ✗", rightX, topY + 175);

  // Info box
  ctx.fillStyle = "#111";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillRect(20, 320, w - 40, h - 340);
  ctx.strokeRect(20, 320, w - 40, h - 340);

  ctx.fillStyle = "#aaa";
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Pauli Exclusion Principle:", 30, 345);
  ctx.fillStyle = "#888";
  ctx.fillText("Identical fermions must have antisymmetric wavefunction under particle exchange", 30, 360);
  ctx.fillText("For two fermions: ψ(x₁, x₂) = -ψ(x₂, x₁)", 30, 375);

  ctx.fillStyle = "#666";
  ctx.font = "10px sans-serif";
  ctx.fillText("• Consequence: No two fermions can occupy identical quantum state (n, l, m_l, m_s)", 30, 400);
  ctx.fillText("• Same quantum numbers forbidden for electrons in atom → shell structure", 30, 415);
  ctx.fillText("• Explains periodic table, chemical bonding, and degeneracy pressure in neutron stars", 30, 430);
  ctx.fillText("• Follows from spin-statistics theorem: half-integer spin → fermionic statistics", 30, 445);
}
