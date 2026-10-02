"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  trail: Array<{ x: number; y: number }>;
}

export function BlackHoleSimulator() {
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
    const GM = 8; // Gravitational parameter
    const schwarzschild = 1; // Event horizon radius

    const particles: Particle[] = [];
    const maxParticles = reduce ? 20 : 50;

    const createParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const r = 5 + Math.random() * 8;
      const v = Math.sqrt(GM / r) * (0.8 + Math.random() * 0.4);

      return {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: -Math.sin(angle) * v,
        vy: Math.cos(angle) * v,
        life: 1,
        trail: [],
      };
    };

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, w, h);

      // Add new particles
      if (particles.length < maxParticles && Math.random() < 0.1) {
        particles.push(createParticle());
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Gravity toward black hole
        const dx = cx - p.x;
        const dy = cy - p.y;
        const r2 = dx * dx + dy * dy;
        const r = Math.sqrt(r2);

        if (r < schwarzschild * 2) {
          particles.splice(i, 1);
          continue;
        }

        const a = GM / (r2 * r);
        p.vx += a * dx * 0.02;
        p.vy += a * dy * 0.02;

        p.x += p.vx * 0.5;
        p.y += p.vy * 0.5;
        p.life -= 0.005;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw trail
        if (!reduce && p.trail.length > 30) {
          p.trail.shift();
        }
        p.trail.push({ x: p.x, y: p.y });

        if (!reduce && p.trail.length > 1) {
          ctx.strokeStyle = `rgba(255, 100, 50, ${p.life * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.stroke();
        }

        // Draw particle
        ctx.fillStyle = `rgba(255, 150, 100, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw accretion disk
      ctx.strokeStyle = "rgba(255, 100, 50, 0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const r = schwarzschild * 4 + i * 1;
        ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw event horizon
      ctx.strokeStyle = "rgba(255, 50, 50, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, schwarzschild, 0, Math.PI * 2);
      ctx.stroke();

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
        className="w-full h-64 bg-gradient-to-b from-slate-900/50 to-slate-950/50 rounded border border-white/10"
      />

      <div className="text-xs leading-relaxed text-white/60 space-y-2">
        <p>
          A black hole is a region of spacetime where gravity is so strong that nothing, not even light, can escape beyond the event horizon (shown in red).
        </p>
        <p>
          Matter spiraling into a black hole heats up through friction in the accretion disk, radiating intense energy. The closer matter gets to the event horizon, the faster it orbits.
        </p>
        <p>
          Black holes are characterized by their mass and spin. Supermassive black holes lurk at the centers of galaxies, including our own Milky Way.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white/5 rounded border border-white/10 p-4">
        <div>
          <h4 className="font-semibold text-white/80 mb-2">Schwarzschild Radius</h4>
          <p className="text-white/60">
            The radius of the event horizon depends on mass: rs = 2GM/c²
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white/80 mb-2">Gravitational Time Dilation</h4>
          <p className="text-white/60">
            Time slows near the event horizon. An observer falling in experiences normal time, but appears to slow from outside.
          </p>
        </div>
      </div>
    </div>
  );
}
