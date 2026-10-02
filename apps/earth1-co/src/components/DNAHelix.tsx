"use client";

import { useEffect, useRef } from "react";

interface Nucleotide {
  base: "A" | "T" | "G" | "C";
  pair: "T" | "A" | "C" | "G";
  position: number;
}

const BASE_COLORS: Record<Nucleotide["base"], string> = {
  A: "rgba(100, 200, 255, 0.8)",  // Adenine - blue
  T: "rgba(255, 150, 100, 0.8)",  // Thymine - orange
  G: "rgba(100, 255, 150, 0.8)",  // Guanine - green
  C: "rgba(255, 100, 200, 0.8)",  // Cytosine - pink
};

const COMPLEMENT: Record<Nucleotide["base"], Nucleotide["pair"]> = {
  A: "T",
  T: "A",
  G: "C",
  C: "G",
};

export function DNAHelix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const radius = Math.min(w, h) * 0.25;
    const turns = 3;
    const points = 40;

    let animationTime = 0;
    const animate = () => {
      if (!reduce) {
        animationTime = (performance.now() / 4000) % 1;
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, w, h);

      // Draw the helix
      for (let i = 0; i < points; i++) {
        const t = i / points;
        const progress = (t + animationTime) % 1;
        const angle = progress * turns * Math.PI * 2;
        const z = (t - 0.5) * h * 0.6;

        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + z;

        const x2 = cx - Math.cos(angle) * radius;
        const y2 = cy + z;

        // Determine base pair
        const bases: Nucleotide["base"][] = ["A", "T", "G", "C"];
        const base = bases[i % 4];
        const pair = COMPLEMENT[base];

        // Draw strands
        ctx.strokeStyle = BASE_COLORS[base];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1 - 8, y1 - 3);
        ctx.lineTo(x1 + 8, y1 + 3);
        ctx.stroke();

        ctx.strokeStyle = BASE_COLORS[pair];
        ctx.beginPath();
        ctx.moveTo(x2 + 8, y2 - 3);
        ctx.lineTo(x2 - 8, y2 + 3);
        ctx.stroke();

        // Draw base pair connection
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Draw nucleotides
        ctx.fillStyle = BASE_COLORS[base];
        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = BASE_COLORS[pair];
        ctx.beginPath();
        ctx.arc(x2, y2, 4, 0, Math.PI * 2);
        ctx.fill();
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: BASE_COLORS.A }} />
          <span className="text-white/70">Adenine (A)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: BASE_COLORS.T }} />
          <span className="text-white/70">Thymine (T)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: BASE_COLORS.G }} />
          <span className="text-white/70">Guanine (G)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: BASE_COLORS.C }} />
          <span className="text-white/70">Cytosine (C)</span>
        </div>
      </div>

      <div className="text-xs leading-relaxed text-white/60 space-y-2">
        <p>
          DNA is a double helix of nucleotides bonded by complementary base pairing: adenine pairs with thymine, and guanine pairs with cytosine. This structure allows cells to replicate their genetic information accurately.
        </p>
        <p>
          Genes are sections of DNA that code for proteins. During replication, the two strands separate and each serves as a template for a new strand, creating two identical DNA molecules.
        </p>
        <p>
          Evolution occurs when mutations introduce variation in DNA sequences, and natural selection acts on this variation over generations, shaping populations and species.
        </p>
      </div>
    </div>
  );
}
