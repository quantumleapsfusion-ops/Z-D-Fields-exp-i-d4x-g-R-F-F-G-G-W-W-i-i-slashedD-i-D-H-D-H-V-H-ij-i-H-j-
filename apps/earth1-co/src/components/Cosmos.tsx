"use client";

import { useEffect, useRef } from "react";

import { type Body, energy, orbiting, step } from "@/lib/newton";

type Planet = Body & {
  name: string;
  size: number;
  light: string;
  mid: string;
  dark: string;
  bands?: string[];
  rings?: boolean;
  moons?: { r: number; period: number; size: number }[];
  trail: number[];
};

type Comet = Body & { born: number; trail: number[] };

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
  ph: number;
  c: string;
};

const TRAIL = 90;
const MAX_COMETS = 14;
const SUBSTEPS = 4;

const PLANETS: Omit<Planet, keyof Body | "trail">[] = [
  { name: "Mercury", size: 2.2, light: "#e6e0d8", mid: "#9d948a", dark: "#3b3632" },
  { name: "Venus", size: 3.6, light: "#fff3d2", mid: "#e0bf7e", dark: "#5b4424" },
  {
    name: "Earth",
    size: 3.9,
    light: "#d6f0ff",
    mid: "#3d86d6",
    dark: "#0b2143",
    bands: ["#5fae6b"],
    moons: [{ r: 3.2, period: 4, size: 1.1 }],
  },
  { name: "Mars", size: 2.9, light: "#ffc7a3", mid: "#c9562e", dark: "#44160b" },
  {
    name: "Jupiter",
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
    name: "Saturn",
    size: 7.8,
    light: "#fff5dc",
    mid: "#d8bb85",
    dark: "#4d3a1e",
    bands: ["#c9a86e", "#efdcb4", "#b8955e"],
    rings: true,
  },
  { name: "Uranus", size: 5.2, light: "#e6ffff", mid: "#7fd3dc", dark: "#123f47" },
  { name: "Neptune", size: 5, light: "#cfe0ff", mid: "#3f63d9", dark: "#0b1647" },
];

const ORBITS = [0.72, 1.02, 1.36, 1.74, 2.45, 3.2, 3.85, 4.4];
const ECCENTRIC = [1.06, 1.01, 1.0, 1.04, 1.02, 1.03, 1.01, 1.0];

function starfield(count: number, w: number, h: number): Star[] {
  const colors = [
    "255,255,255",
    "205,222,255",
    "255,236,214",
    "180,200,255",
    "255,214,190",
  ];
  return Array.from({ length: count }, () => {
    // A third of the stars crowd a diagonal Milky Way band.
    const band = Math.random() < 0.34;
    let x = Math.random();
    let y = Math.random();
    if (band) {
      const t = Math.random();
      const spread = (Math.random() + Math.random() + Math.random() - 1.5) * 0.16;
      x = t;
      y = 0.18 + t * 0.64 + spread;
    }
    const big = Math.random();
    return {
      x: x * w,
      y: y * h,
      r: big > 0.985 ? 1.5 : big > 0.9 ? 1 : 0.6,
      a: 0.25 + Math.random() * 0.75,
      tw: 0.4 + Math.random() * 2.2,
      ph: Math.random() * Math.PI * 2,
      c: colors[Math.floor(Math.random() * colors.length)],
    };
  });
}

function paintNebula(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#020309";
  ctx.fillRect(0, 0, w, h);
  const clouds: [number, number, number, string][] = [
    [0.15, 0.25, 0.55, "rgba(70,60,190,0.20)"],
    [0.85, 0.8, 0.6, "rgba(20,110,190,0.16)"],
    [0.55, 0.5, 0.5, "rgba(150,70,170,0.10)"],
    [0.3, 0.75, 0.4, "rgba(40,150,170,0.08)"],
    [0.8, 0.15, 0.35, "rgba(200,110,80,0.06)"],
  ];
  const m = Math.max(w, h);
  for (const [cx, cy, r, c] of clouds) {
    const g = ctx.createRadialGradient(cx * w, cy * h, 0, cx * w, cy * h, r * m);
    g.addColorStop(0, c);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  // Milky Way glow along the star band.
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(Math.atan2(h * 0.64, w));
  const len = Math.hypot(w, h);
  const glow = ctx.createLinearGradient(0, -h * 0.2, 0, h * 0.2);
  glow.addColorStop(0, "rgba(0,0,0,0)");
  glow.addColorStop(0.5, "rgba(170,180,255,0.07)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(-len / 2, -h * 0.2, len, h * 0.4);
  ctx.restore();
}

/**
 * The home sky: thousands of stars over a Milky Way band, and a solar system run by Newton's law
 * of gravitation. Every planet (and every comet you tap into the sky) is stepped under the Sun's
 * inverse-square pull, so orbits speed up near the Sun and slow down far from it.
 */
export function Cosmos({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const planets: Planet[] = PLANETS.map((p, i) => ({
      ...p,
      ...orbiting(ORBITS[i], Math.random() * Math.PI * 2, ECCENTRIC[i]),
      trail: [],
    }));
    const comets: Comet[] = [];
    let stars: Star[] = [];
    let backdrop: HTMLCanvasElement | null = null;
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
    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null =
      null;
    const look = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      tilt = Math.min(0.72, Math.max(0.36, (h / w) * 0.34));
      scale = Math.min((w * 0.47) / 4.6, (h * 0.46) / (4.6 * tilt));
      cx = w / 2;
      cy = h * (w < 640 ? 0.44 : 0.4);
      const small = w < 640;
      stars = starfield(Math.round((w * h) / (small ? 260 : 380)), w * 1.1, h * 1.1);
      backdrop = document.createElement("canvas");
      backdrop.width = el.width;
      backdrop.height = el.height;
      const b = backdrop.getContext("2d");
      if (b) {
        b.scale(dpr, dpr);
        paintNebula(b, w, h);
      }
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
    const onTap = (event: PointerEvent) => {
      const x = (event.clientX - cx - look.x * 10) / scale;
      const y = (event.clientY - cy - look.y * 8) / (scale * tilt);
      const r = Math.hypot(x, y);
      if (r < 0.35 || r > 7) return;
      const comet: Comet = {
        ...orbiting(r, Math.atan2(y, x), 0.55 + Math.random() * 0.4),
        born: time,
        trail: [],
      };
      comets.push(comet);
      if (comets.length > MAX_COMETS) comets.shift();
      navigator.vibrate?.(12);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("deviceorientation", onOrientation);
    el.addEventListener("pointerdown", onTap);

    const drawStars = () => {
      const ox = -look.x * 14 - w * 0.05;
      const oy = -look.y * 10 - h * 0.05;
      for (const s of stars) {
        const twinkle = 0.65 + 0.35 * Math.sin(time * s.tw + s.ph);
        ctx.fillStyle = `rgba(${s.c},${s.a * twinkle})`;
        const px = s.x + ox * s.r;
        const py = s.y + oy * s.r;
        if (s.r > 1.2) {
          ctx.beginPath();
          ctx.arc(px, py, s.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(${s.c},${0.12 * twinkle})`;
          ctx.fillRect(px - 5, py - 0.3, 10, 0.6);
          ctx.fillRect(px - 0.3, py - 5, 0.6, 10);
        } else {
          ctx.fillRect(px, py, s.r, s.r);
        }
      }
    };

    const drawSun = () => {
      const { px, py } = project(0, 0);
      const pulse = 1 + Math.sin(time * 1.3) * 0.02;
      const r = Math.max(9, scale * 0.16) * pulse;
      ctx.globalCompositeOperation = "lighter";
      const corona = ctx.createRadialGradient(px, py, 0, px, py, r * 7);
      corona.addColorStop(0, "rgba(255,230,170,0.55)");
      corona.addColorStop(0.15, "rgba(255,170,80,0.22)");
      corona.addColorStop(0.45, "rgba(255,120,60,0.06)");
      corona.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(px, py, r * 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(time * 0.05);
      for (let i = 0; i < 12; i += 1) {
        ctx.rotate(Math.PI / 6);
        const ray = ctx.createLinearGradient(0, 0, r * 5.5, 0);
        ray.addColorStop(0, "rgba(255,220,160,0.18)");
        ray.addColorStop(1, "rgba(255,220,160,0)");
        ctx.fillStyle = ray;
        ctx.fillRect(0, -0.6, r * (4 + (i % 3)), 1.2);
      }
      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
      const disc = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r);
      disc.addColorStop(0, "#fffdf2");
      disc.addColorStop(0.55, "#ffd98a");
      disc.addColorStop(1, "#ff9a3c");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawOrbitGuides = () => {
      ctx.lineWidth = 0.6;
      for (let i = 0; i < ORBITS.length; i += 1) {
        const { px, py } = project(0, 0);
        ctx.strokeStyle = `rgba(140,170,255,${0.07 + (i === 2 ? 0.05 : 0)})`;
        ctx.beginPath();
        ctx.ellipse(
          px,
          py,
          ORBITS[i] * scale,
          ORBITS[i] * scale * tilt,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    };

    const drawTrail = (trail: number[], rgb: string, width: number) => {
      const n = trail.length / 2;
      if (n < 2) return;
      ctx.lineCap = "round";
      for (let i = 1; i < n; i += 1) {
        const a = project(trail[(i - 1) * 2], trail[(i - 1) * 2 + 1]);
        const b = project(trail[i * 2], trail[i * 2 + 1]);
        ctx.strokeStyle = `rgba(${rgb},${(i / n) * 0.35})`;
        ctx.lineWidth = width * (i / n);
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

      const glow = ctx.createRadialGradient(px, py, r * 0.8, px, py, r * 2.6);
      glow.addColorStop(0, `${p.mid}33`);
      glow.addColorStop(1, `${p.mid}00`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, r * 2.6, 0, Math.PI * 2);
      ctx.fill();

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
        const mx = px + Math.cos(a) * r * m.r;
        const my = py + Math.sin(a) * r * m.r * 0.4;
        ctx.fillStyle = "rgba(225,228,240,0.9)";
        ctx.beginPath();
        ctx.arc(mx, my, m.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawComet = (c: Comet) => {
      const { px, py } = project(c.x, c.y);
      const r = Math.hypot(c.x, c.y);
      const len = Math.min(80, (38 / r) * Math.min(1.6, scale / 70));
      const tx = px + (c.x / r) * len;
      const ty = py + (c.y / r) * len * tilt;
      ctx.globalCompositeOperation = "lighter";
      const tail = ctx.createLinearGradient(px, py, tx, ty);
      tail.addColorStop(0, "rgba(190,230,255,0.75)");
      tail.addColorStop(1, "rgba(120,170,255,0)");
      ctx.strokeStyle = tail;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#f4fbff";
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawShootingStar = (dt: number) => {
      if (!shooting && Math.random() < dt * 0.12) {
        shooting = {
          x: Math.random() * w,
          y: Math.random() * h * 0.4,
          vx: (Math.random() < 0.5 ? -1 : 1) * (380 + Math.random() * 260),
          vy: 160 + Math.random() * 120,
          life: 1,
        };
      }
      if (!shooting) return;
      shooting.x += shooting.vx * dt;
      shooting.y += shooting.vy * dt;
      shooting.life -= dt * 1.4;
      const g = ctx.createLinearGradient(
        shooting.x,
        shooting.y,
        shooting.x - shooting.vx * 0.12,
        shooting.y - shooting.vy * 0.12,
      );
      g.addColorStop(0, `rgba(255,255,255,${Math.max(0, shooting.life)})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(shooting.x, shooting.y);
      ctx.lineTo(shooting.x - shooting.vx * 0.12, shooting.y - shooting.vy * 0.12);
      ctx.stroke();
      if (shooting.life <= 0) shooting = null;
    };

    const advance = (dt: number) => {
      const h2 = dt / SUBSTEPS;
      for (let s = 0; s < SUBSTEPS; s += 1) {
        for (const p of planets) step(p, h2);
        for (const c of comets) step(c, h2);
      }
      for (const body of [...planets, ...comets]) {
        body.trail.push(body.x, body.y);
        if (body.trail.length > TRAIL * 2) body.trail.splice(0, 2);
      }
      for (let i = comets.length - 1; i >= 0; i -= 1) {
        const r = Math.hypot(comets[i].x, comets[i].y);
        const lost = r > 12 && energy(comets[i]) > 0;
        if (r < 0.12 || lost || time - comets[i].born > 90) comets.splice(i, 1);
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
      if (backdrop) ctx.drawImage(backdrop, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawStars();
      if (!reduce) drawShootingStar(dt);
      drawOrbitGuides();

      const behind = planets.filter((p) => p.y < 0).sort((a, b) => a.y - b.y);
      const front = planets.filter((p) => p.y >= 0).sort((a, b) => a.y - b.y);
      for (const p of planets) drawTrail(p.trail, "150,185,255", 1.4);
      for (const c of comets) drawTrail(c.trail, "170,220,255", 1.6);
      behind.forEach(drawPlanet);
      drawSun();
      front.forEach(drawPlanet);
      comets.forEach(drawComet);

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
      el.removeEventListener("pointerdown", onTap);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className={className} />;
}
