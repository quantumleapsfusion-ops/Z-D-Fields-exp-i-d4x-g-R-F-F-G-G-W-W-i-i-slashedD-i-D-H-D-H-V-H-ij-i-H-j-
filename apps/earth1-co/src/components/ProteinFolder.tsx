"use client";

import { useEffect, useRef, useState } from "react";

interface AminoAcidDef {
  name: string;
  code: string;
  color: string;
  type: "hydrophobic" | "hydrophilic" | "charged" | "polar";
}

interface AminoAcid extends AminoAcidDef {
  x: number;
  y: number;
}

const AMINO_ACIDS: AminoAcidDef[] = [
  { name: "Leucine", code: "L", color: "#f97316", type: "hydrophobic" },
  { name: "Isoleucine", code: "I", color: "#ea580c", type: "hydrophobic" },
  { name: "Valine", code: "V", color: "#dc2626", type: "hydrophobic" },
  { name: "Lysine", code: "K", color: "#10b981", type: "charged" },
  { name: "Aspartate", code: "D", color: "#ec4899", type: "charged" },
  { name: "Glutamate", code: "E", color: "#f472b6", type: "charged" },
  { name: "Serine", code: "S", color: "#fbbf24", type: "polar" },
  { name: "Threonine", code: "T", color: "#f59e0b", type: "polar" },
  { name: "Histidine", code: "H", color: "#3b82f6", type: "hydrophilic" },
  { name: "Arginine", code: "R", color: "#06b6d4", type: "hydrophilic" },
];

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

export function ProteinFolder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;

    const sequence = AMINO_ACIDS.slice(0, 10);
    const aminoAcids: AminoAcid[] = sequence.map((aa, i) => ({
      ...aa,
      x: cx - (sequence.length / 2) * 40 + i * 40,
      y: cy,
    }));

    let time = 0;
    let frameCount = 0;

    const render = () => {
      if (playing && !reduceMotion) {
        time += 0.01;
        frameCount += 1;
      }

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      const foldProgress = Math.min(1, time * 0.5);

      for (let i = 0; i < aminoAcids.length; i++) {
        const aa = sequence[i];
        const angle = (i / sequence.length) * Math.PI * 2 * foldProgress;
        const radius = 80 + foldProgress * 40;

        const startX = cx - (sequence.length / 2) * 40 + i * 40;
        const startY = cy;

        const foldX = cx + Math.cos(angle) * radius;
        const foldY = cy - Math.sin(angle) * radius * 0.6;

        aminoAcids[i].x = startX + (foldX - startX) * foldProgress;
        aminoAcids[i].y = startY + (foldY - startY) * foldProgress;
      }

      if (foldProgress < 0.95) {
        for (let i = 0; i < aminoAcids.length - 1; i++) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * (1 - foldProgress * 0.5)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(aminoAcids[i].x, aminoAcids[i].y);
          ctx.lineTo(aminoAcids[i + 1].x, aminoAcids[i + 1].y);
          ctx.stroke();
        }
      }

      const coreRadius = 20 + foldProgress * 30;
      if (foldProgress > 0.5) {
        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
        coreGradient.addColorStop(0, "rgba(249, 115, 22, 0.4)");
        coreGradient.addColorStop(1, "rgba(220, 38, 38, 0.1)");
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < aminoAcids.length; i++) {
        const aa = aminoAcids[i];
        const size = 8 + foldProgress * 4;

        ctx.fillStyle = aa.color;
        ctx.globalAlpha = 0.7 + foldProgress * 0.3;
        ctx.beginPath();
        ctx.arc(aa.x, aa.y, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 1;
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(aa.code, aa.x, aa.y);
      }

      ctx.globalAlpha = 1;

      ctx.fillStyle = "#fff";
      ctx.font = "12px monospace";
      ctx.globalAlpha = 0.6;
      const statusText = foldProgress < 0.95 ? "Folding..." : "Folded";
      ctx.fillText(statusText, cx, 50);

      if (time > 3 && !reduceMotion) {
        time = 0;
      }
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => clearInterval(animationId);
  }, [playing]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspectRatio: "1000 / 600" }}
        />
        <figcaption className="sr-only">
          Protein folding animation showing amino acid chain transition from unfolded linear
          structure to compact 3D fold with hydrophobic core formation.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="toggle" onClick={() => setPlaying(!playing)}>
            {playing ? "Pause" : "Resume"}
          </button>
        </div>

        <p className="source text-sm leading-relaxed">
          Proteins are chains of amino acids linked by peptide bonds. The twenty amino acids have
          different chemical properties: some are hydrophobic (water-repelling, shown in orange/red),
          others hydrophilic (water-loving, shown in blue), and some carry electrical charges (green/pink).
          The linear chain spontaneously folds into a compact 3D structure driven by the hydrophobic effect—
          nonpolar residues cluster in the interior, away from water, while polar residues face outward.
          This folding into the correct 3D shape is crucial: the shape determines the protein's function.
          Enzymes like ATP synthase fold to create precise active sites that catalyze specific reactions.
          Incorrect folding can cause diseases like Alzheimer's and Parkinson's. The cell has molecular
          chaperones that help proteins fold correctly and even unfold misfolded ones for refolding.
        </p>
      </div>
    </div>
  );
}
