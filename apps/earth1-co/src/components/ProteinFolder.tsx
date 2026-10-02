"use client";

import { useEffect, useRef, useState } from "react";

interface AminoAcidDef {
  type: "hydrophobic" | "hydrophilic" | "charged" | "polar";
  label: string;
  color: string;
}

interface AminoAcid extends AminoAcidDef {
  x: number;
  y: number;
}

const AMINO_ACIDS: AminoAcidDef[] = [
  { type: "hydrophobic" as const, label: "Leu", color: "rgba(255, 150, 100, 0.9)" },
  { type: "hydrophobic" as const, label: "Val", color: "rgba(255, 150, 100, 0.9)" },
  { type: "hydrophilic" as const, label: "Ser", color: "rgba(100, 200, 255, 0.9)" },
  { type: "charged" as const, label: "Lys", color: "rgba(100, 255, 150, 0.9)" },
  { type: "charged" as const, label: "Asp", color: "rgba(255, 100, 200, 0.9)" },
  { type: "hydrophobic" as const, label: "Pro", color: "rgba(255, 150, 100, 0.9)" },
  { type: "polar" as const, label: "Cys", color: "rgba(255, 200, 100, 0.9)" },
  { type: "hydrophilic" as const, label: "Asn", color: "rgba(100, 200, 255, 0.9)" },
];

export function ProteinFolder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [folded, setFolded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    let animationTime = 0;

    const generateChain = (isFolded: boolean, progress: number) => {
      const chain: AminoAcid[] = [];
      const count = AMINO_ACIDS.length;

      for (let i = 0; i < count; i++) {
        const amino = AMINO_ACIDS[i];
        let x, y;

        if (isFolded) {
          // Folded state: compact structure
          const angle = (i / count) * Math.PI * 2 * (1 + progress);
          const radius = 40 * (1 - progress * 0.3);
          x = cx + Math.cos(angle) * radius;
          y = cy + Math.sin(angle) * radius;
        } else {
          // Unfolded state: linear chain
          const spacing = w / (count + 1);
          x = spacing * (i + 1) * (1 - progress * 0.3);
          y = cy + Math.sin((i / count) * Math.PI * progress * 2) * 40;
        }

        chain.push({ ...amino, x, y });
      }
      return chain;
    };

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, w, h);

      if (!reduce) {
        animationTime = (performance.now() / 3000) % 1;
      }

      // Determine if we're folding or unfolding
      const phase = animationTime < 0.5 ? animationTime * 2 : 2 - animationTime * 2;
      const isFolding = animationTime < 0.5;
      const chain = generateChain(isFolding, phase);

      // Draw bonds
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chain[0].x, chain[0].y);
      for (let i = 1; i < chain.length; i++) {
        ctx.lineTo(chain[i].x, chain[i].y);
      }
      ctx.stroke();

      // Draw amino acids
      for (const amino of chain) {
        ctx.fillStyle = amino.color;
        ctx.beginPath();
        ctx.arc(amino.x, amino.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw label
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(amino.label, amino.x, amino.y);
      }

      // Draw hydrophobic core indicator when folded
      if (isFolding && phase > 0.3) {
        ctx.strokeStyle = `rgba(255, 150, 100, ${(phase - 0.3) * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 35 * (1 - (phase - 0.3)), 0, Math.PI * 2);
        ctx.stroke();
      }

      if (!reduce) {
        requestAnimationFrame(animate);
      }
    };

    animate();

    const handleResize = () => {
      const newW = canvas.clientWidth;
      const newH = canvas.clientHeight;
      canvas.width = newW * dpr;
      canvas.height = newH * dpr;
      ctx.scale(dpr, dpr);
      animate();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="space-y-6">
      <canvas
        ref={canvasRef}
        className="w-full h-64 bg-gradient-to-b from-slate-900/30 to-slate-950/30 rounded border border-white/10"
      />

      <div className="text-xs leading-relaxed text-white/60 space-y-2">
        <p>
          Proteins are chains of amino acids linked by peptide bonds. Amino acids have different chemical properties: hydrophobic (water-repelling), hydrophilic (water-loving), charged, and polar.
        </p>
        <p>
          Proteins fold into 3D structures driven by thermodynamics. Hydrophobic amino acids cluster in the interior, while hydrophilic ones face the aqueous environment. This folding determines a protein's function.
        </p>
        <p>
          Misfolded proteins can cause diseases like Alzheimer's. Cells use chaperone proteins to help others fold correctly and degradation pathways to remove misfolded ones.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/5 rounded border border-white/10 p-4">
        <div>
          <h4 className="font-semibold text-white/80 mb-1">Hydrophobic</h4>
          <div className="w-3 h-3 rounded inline-block" style={{ backgroundColor: "rgba(255, 150, 100, 0.9)" }} />
          <p className="text-white/60">Cluster inside</p>
        </div>
        <div>
          <h4 className="font-semibold text-white/80 mb-1">Hydrophilic</h4>
          <div className="w-3 h-3 rounded inline-block" style={{ backgroundColor: "rgba(100, 200, 255, 0.9)" }} />
          <p className="text-white/60">Face water</p>
        </div>
        <div>
          <h4 className="font-semibold text-white/80 mb-1">Charged</h4>
          <div className="w-3 h-3 rounded inline-block" style={{ backgroundColor: "rgba(100, 255, 150, 0.9)" }} />
          <p className="text-white/60">Interact</p>
        </div>
        <div>
          <h4 className="font-semibold text-white/80 mb-1">Polar</h4>
          <div className="w-3 h-3 rounded inline-block" style={{ backgroundColor: "rgba(255, 200, 100, 0.9)" }} />
          <p className="text-white/60">Form bonds</p>
        </div>
      </div>

      <div className="text-xs leading-relaxed text-white/60 space-y-2">
        <p className="font-semibold text-white/80">Enzyme Kinetics</p>
        <p>
          Enzymes are proteins that catalyze reactions. They bind substrate molecules, stabilize transition states, and lower activation energy, allowing reactions to proceed at biological rates (milliseconds to seconds instead of years).
        </p>
        <p>
          The Michaelis-Menten equation describes how reaction rate depends on enzyme concentration and substrate concentration. When substrate is abundant, reaction rate is limited by enzyme amount.
        </p>

        <p className="font-semibold text-white/80 mt-4">Cellular Energy: ATP Synthase</p>
        <p>
          ATP synthase is a molecular motor that harnesses the energy of proton gradients across membranes. As protons flow through it, the protein rotates, driving the synthesis of ATP from ADP and phosphate. One ATP synthase makes about 100 ATPs per second.
        </p>
        <p>
          Mitochondria and chloroplasts use chemiosmosis: electron transport chains pump protons, creating gradients. ATP synthase then converts that stored energy into chemical energy in ATP.
        </p>

        <p className="font-semibold text-white/80 mt-4">Metabolic Pathways</p>
        <p>
          Cells break down glucose in glycolysis, the citric acid cycle, and oxidative phosphorylation to extract energy. Glucose → 2 pyruvate → Acetyl-CoA → CO₂, yielding ~30 ATP per glucose. Excess energy is stored as fat, glycogen, or other molecules.
        </p>
      </div>
    </div>
  );
}
