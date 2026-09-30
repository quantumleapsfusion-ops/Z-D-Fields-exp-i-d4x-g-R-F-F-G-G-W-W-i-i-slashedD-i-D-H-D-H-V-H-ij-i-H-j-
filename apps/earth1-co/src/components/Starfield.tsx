"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
  ph: number;
  depth: number;
};

/** Seeded PRNG so the sky is identical on every visit. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  return (rand() + rand() + rand() + rand() - 2) / 2;
}

function makeStars(w: number, h: number): Star[] {
  const rand = rng(1);
  const stars: Star[] = [];
  const push = (x: number, y: number, canBeBright: boolean) => {
    const bright = canBeBright && rand() < 0.06;
    stars.push({
      x,
      y,
      r: bright ? 0.9 + rand() * 0.7 : 0.25 + rand() ** 3 * 0.7,
      a: bright ? 0.85 + rand() * 0.15 : 0.2 + rand() * 0.6,
      tw: 0.2 + rand() * 0.9,
      ph: rand() * Math.PI * 2,
      depth: 0.2 + rand() * 0.8,
    });
  };
  const field = Math.round((w * h) / 1400);
  for (let i = 0; i < field; i += 1) push(rand() * w, rand() * h, true);
  // A galaxy band from corner to corner, densest along its spine.
  const len = Math.hypot(w, h);
  const ux = w / len;
  const uy = -h / len;
  const band = Math.round((w * h) / 900);
  for (let i = 0; i < band; i += 1) {
    const t = (rand() - 0.5) * len * 1.1;
    const off = gauss(rand) * Math.min(w, h) * 0.16;
    push(w / 2 + ux * t - uy * off, h / 2 + uy * t + ux * off, false);
  }
  return stars;
}

/** Black sky with a white galaxy band that drifts slowly and follows the pointer or phone tilt. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 1;
    let h = 1;
    let dpr = 1;
    let stars: Star[] = [];
    let haze: HTMLCanvasElement | null = null;
    let frame = 0;
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

    const paintHaze = () => {
      const c = document.createElement("canvas");
      c.width = el.width;
      c.height = el.height;
      const g = c.getContext("2d");
      if (!g) return null;
      g.scale(dpr, dpr);
      g.translate(w / 2, h / 2);
      g.rotate(-Math.atan2(h, w));
      g.scale(1, 0.22);
      const glow = g.createRadialGradient(0, 0, 0, 0, 0, Math.hypot(w, h) * 0.55);
      glow.addColorStop(0, "rgba(255,255,255,0.08)");
      glow.addColorStop(0.5, "rgba(255,255,255,0.03)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = glow;
      g.fillRect(-w * 2, -h * 6, w * 4, h * 12);
      return c;
    };

    const draw = (now: number) => {
      tilt.x += (tilt.tx - tilt.x) * 0.05;
      tilt.y += (tilt.ty - tilt.y) * 0.05;
      const t = now / 1000;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, el.width, el.height);
      if (haze) ctx.drawImage(haze, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#fff";
      const drift = reduce ? 0 : t * 1.5;
      for (const s of stars) {
        const x = (((s.x + (drift + tilt.x * 18) * s.depth) % w) + w) % w;
        const y = s.y + tilt.y * 18 * s.depth;
        const a = reduce ? s.a : s.a * (0.7 + 0.3 * Math.sin(t * s.tw + s.ph));
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 0.9) {
          ctx.globalAlpha = a * 0.12;
          ctx.beginPath();
          ctx.arc(x, y, s.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (!reduce) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      stars = makeStars(w, h);
      haze = paintHaze();
      if (reduce) requestAnimationFrame(draw);
    };

    const onPointer = (e: PointerEvent) => {
      tilt.tx = e.clientX / w - 0.5;
      tilt.ty = e.clientY / h - 0.5;
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tilt.tx = Math.max(-1, Math.min(1, e.gamma / 45)) * 0.5;
      tilt.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 45)) * 0.5;
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      window.addEventListener("pointermove", onPointer);
      window.addEventListener("deviceorientation", onOrient);
      frame = requestAnimationFrame(draw);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-black"
    />
  );
}
