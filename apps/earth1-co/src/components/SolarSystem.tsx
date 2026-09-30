"use client";

import { useEffect, useRef } from "react";

import { type Body, orbiting, step } from "@/lib/newton";

type Planet = Body & {
  size: number;
  light: string;
  mid: string;
  dark: string;
  bands?: string[];
  rings?: boolean;
  moons?: { r: number; period: number; size: number }[];
  trail: number[];
};

const TRAIL = 70;
const SUBSTEPS = 4;

const PLANETS: Omit<Planet, keyof Body | "trail">[] = [
  { size: 2.2, light: "#e6e0d8", mid: "#9d948a", dark: "#3b3632" },
  { size: 3.6, light: "#fff3d2", mid: "#e0bf7e", dark: "#5b4424" },
  {
    size: 3.9,
    light: "#d6f0ff",
    mid: "#3d86d6",
    dark: "#0b2143",
    bands: ["#5fae6b"],
    moons: [{ r: 3.2, period: 4, size: 1.1 }],
  },
  { size: 2.9, light: "#ffc7a3", mid: "#c9562e", dark: "#44160b" },
  {
    size: 9.5,
    light: "#fff1dc",
    mid: "#cfa47a",
    dark: "#4a3020",
    bands: ["#a9744d", "#e9d4b6", "#9a6a47", "#f1dfc6", "#b98460"],
    moons: [
      { r: 2.0, period: 3, size: 1 },
      { r: 2.6, period: 5, size: 1.2 },
      { r: 3.3, period: 8, size: 1.3 },
    ],
  },
  {
    size: 7.8,
    light: "#fff5dc",
    mid: "#d8bb85",
    dark: "#4d3a1e",
    bands: ["#c9a86e", "#efdcb4", "#b8955e"],
    rings: true,
  },
  { size: 5.2, light: "#e6ffff", mid: "#7fd3dc", dark: "#123f47" },
  { size: 5, light: "#cfe0ff", mid: "#3f63d9", dark: "#0b1647" },
];

const ORBITS = [0.72, 1.02, 1.36, 1.74, 2.45, 3.2, 3.85, 4.4];
const ECCENTRIC = [1.06, 1.01, 1.0, 1.04, 1.02, 1.03, 1.01, 1.0];

/**
 * The eight planets orbiting the Sun under Newton's inverse-square law, drawn on a transparent
 * canvas above the Milky Way. Orbits speed up near the Sun and slow down far from it.
 */
export function SolarSystem() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const planets: Planet[] = PLANETS.map((p, i) => ({
      ...p,
      ...orbiting(ORBITS[i], (i * 2.39996 + 0.7) % (Math.PI * 2), ECCENTRIC[i]),
      trail: [],
    }));
    let dpr = 1;
    let w = 0;
    let h = 0;
    let scale = 1;
    let tilt = 0.42;
    let cx = 0;
    let cy = 0;
    let frame = 0;
    let last = performance.now();
    let time = 0;
    const look = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      tilt = Math.min(0.72, Math.max(0.36, (h / w) * 0.34));
      scale = Math.min((w * 0.46) / 4.6, (h * 0.27) / (4.6 * tilt));
      cx = w / 2;
      cy = h * (w < 640 ? 0.33 : 0.36);
    };
    resize();

    const project = (x: number, y: number) => ({
      px: cx + x * scale + look.x * 10,
      py: cy + y * scale * tilt + look.y * 8,
      depth: 1 + y * 0.05,
    });

    const onPointer = (event: PointerEvent) => {
      look.tx = (event.clientX / w) * 2 - 1;
      look.ty = (event.clientY / h) * 2 - 1;
    };
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      look.tx = Math.max(-1, Math.min(1, event.gamma / 30));
      look.ty = Math.max(-1, Math.min(1, (event.beta - 45) / 30));
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("deviceorientation", onOrientation);

    const drawSun = () => {
      const { px, py } = project(0, 0);
      const r = Math.max(8, scale * 0.15) * (1 + Math.sin(time * 1.3) * 0.02);
      ctx.globalCompositeOperation = "lighter";
      const corona = ctx.createRadialGradient(px, py, 0, px, py, r * 6);
      corona.addColorStop(0, "rgba(255,244,220,0.5)");
      corona.addColorStop(0.18, "rgba(255,220,170,0.16)");
      corona.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(px, py, r * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      const disc = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r);
      disc.addColorStop(0, "#ffffff");
      disc.addColorStop(0.6, "#fff1cf");
      disc.addColorStop(1, "#ffc978");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawOrbits = () => {
      const { px, py } = project(0, 0);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      for (const o of ORBITS) {
        ctx.beginPath();
        ctx.ellipse(px, py, o * scale, o * scale * tilt, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const drawTrail = (trail: number[]) => {
      const n = trail.length / 2;
      if (n < 2) return;
      ctx.lineCap = "round";
      for (let i = 1; i < n; i += 1) {
        const a = project(trail[(i - 1) * 2], trail[(i - 1) * 2 + 1]);
        const b = project(trail[i * 2], trail[i * 2 + 1]);
        ctx.strokeStyle = `rgba(255,255,255,${(i / n) * 0.22})`;
        ctx.lineWidth = 1.2 * (i / n);
        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.stroke();
      }
    };

    const ringPass = (px: number, py: number, r: number, front: boolean) => {
      ctx.save();
      ctx.beginPath();
      if (front) ctx.rect(px - r * 4, py, r * 8, r * 4);
      else ctx.rect(px - r * 4, py - r * 4, r * 8, r * 4);
      ctx.clip();
      const bands: [number, number, string][] = [
        [1.35, 0.18, "rgba(170,150,120,0.35)"],
        [1.62, 0.22, "rgba(240,225,190,0.75)"],
        [1.95, 0.2, "rgba(225,205,165,0.6)"],
        [2.2, 0.06, "rgba(245,235,215,0.5)"],
      ];
      for (const [k, wdt, c] of bands) {
        ctx.strokeStyle = c;
        ctx.lineWidth = r * wdt;
        ctx.beginPath();
        ctx.ellipse(px, py, r * k, r * k * 0.34, -0.32, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawPlanet = (p: Planet) => {
      const { px, py, depth } = project(p.x, p.y);
      const r = p.size * Math.min(1.8, Math.max(1.05, scale / 60)) * depth;
      const sun = project(0, 0);
      const ang = Math.atan2(sun.py - py, sun.px - px);
      const hx = px + Math.cos(ang) * r * 0.45;
      const hy = py + Math.sin(ang) * r * 0.45;

      if (p.rings) ringPass(px, py, r, false);

      const body = ctx.createRadialGradient(hx, hy, r * 0.05, px, py, r * 1.05);
      body.addColorStop(0, p.light);
      body.addColorStop(0.5, p.mid);
      body.addColorStop(1, p.dark);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();

      if (p.bands && r > 3) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.35;
        const n = p.bands.length;
        p.bands.forEach((c, i) => {
          ctx.fillStyle = c;
          const y = py - r + ((i + 0.5) / n) * 2 * r;
          ctx.fillRect(px - r, y - r / (n * 1.6), 2 * r, r / (n * 0.9));
        });
        ctx.globalAlpha = 1;
        const shade = ctx.createRadialGradient(hx, hy, r * 0.3, px, py, r * 1.1);
        shade.addColorStop(0, "rgba(0,0,0,0)");
        shade.addColorStop(1, "rgba(0,0,0,0.65)");
        ctx.fillStyle = shade;
        ctx.fillRect(px - r, py - r, 2 * r, 2 * r);
        ctx.restore();
      }

      if (p.rings) ringPass(px, py, r, true);

      for (const m of p.moons ?? []) {
        const a = (time / m.period) * Math.PI * 2;
        ctx.fillStyle = "rgba(235,238,245,0.9)";
        ctx.beginPath();
        ctx.arc(
          px + Math.cos(a) * r * m.r,
          py + Math.sin(a) * r * m.r * 0.4,
          m.size,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    };

    const advance = (dt: number) => {
      const sub = dt / SUBSTEPS;
      for (let s = 0; s < SUBSTEPS; s += 1) for (const p of planets) step(p, sub);
      for (const p of planets) {
        p.trail.push(p.x, p.y);
        if (p.trail.length > TRAIL * 2) p.trail.splice(0, 2);
      }
    };

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce) {
        time += dt;
        advance(dt);
      }
      look.x += (look.tx - look.x) * 0.04;
      look.y += (look.ty - look.y) * 0.04;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawOrbits();
      for (const p of planets) drawTrail(p.trail);
      const behind = planets.filter((p) => p.y < 0).sort((a, b) => a.y - b.y);
      const front = planets.filter((p) => p.y >= 0).sort((a, b) => a.y - b.y);
      behind.forEach(drawPlanet);
      drawSun();
      front.forEach(drawPlanet);

      if (!reduce) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    const observer = new ResizeObserver(() => {
      resize();
      if (reduce) requestAnimationFrame(draw);
    });
    observer.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
