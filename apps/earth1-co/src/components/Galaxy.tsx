"use client";

import { useEffect, useRef } from "react";

type Star = {
  r: number;
  theta: number;
  z: number;
  size: number;
  color: string;
  alpha: number;
};

const ARMS = 2;
const WINDING = 5.6;

function gauss() {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
}

function colorFor(r: number, knot: boolean): string {
  if (knot) return "255,150,190";
  if (r < 0.14) return "255,226,178";
  if (r < 0.4) return "255,242,228";
  return Math.random() < 0.6 ? "170,200,255" : "214,228,255";
}

function makeStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i += 1) {
    const kind = Math.random();
    let r: number;
    let theta: number;
    let knot = false;
    if (kind < 0.14) {
      r = Math.abs(gauss()) * 0.18;
      theta = Math.random() * Math.PI * 2;
    } else if (kind < 0.4) {
      r = Math.min(1.05, -Math.log(1 - Math.random() * 0.95) * 0.3);
      theta = Math.random() * Math.PI * 2;
    } else {
      r = 0.08 + Math.pow(Math.random(), 0.85) * 0.95;
      const arm = (i % ARMS) * ((Math.PI * 2) / ARMS);
      theta =
        arm + Math.log(r / 0.08) * (WINDING / 2.5) + gauss() * (0.35 + 0.25 * (1 - r));
      r *= 1 + gauss() * 0.06;
      knot = Math.random() < 0.03;
    }
    stars.push({
      r,
      theta,
      z: gauss() * 0.03 * (1 - r),
      size: knot ? 2.2 : Math.random() < 0.06 ? 1.5 : 1,
      color: colorFor(r, knot),
      alpha: knot ? 0.3 : 0.2 + Math.random() * 0.5,
    });
  }
  return stars;
}

/**
 * A two-armed barred spiral drawn star by star. It turns slowly (inner stars faster) and tilts
 * toward the cursor or finger.
 */
export function Galaxy({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 640;
    const stars = makeStars(small ? 7000 : 16000);
    const field = Array.from({ length: small ? 260 : 520 }, () => ({
      x: Math.random(),
      y: Math.random(),
      a: 0.15 + Math.random() * 0.5,
    }));
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let dpr = 1;
    let width = 0;
    let height = 0;
    let frame = 0;
    let spin = 0;
    let last = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = el.clientWidth;
      height = el.clientHeight;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
    };
    resize();

    const onPointer = (event: PointerEvent) => {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce) spin += dt * 0.035;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, width, height);

      for (const s of field) {
        ctx.fillStyle = `rgba(230,236,255,${s.a})`;
        ctx.fillRect(s.x * width, s.y * height, 1, 1);
      }

      const cx = width / 2 + pointer.x * 24;
      const cy = height / 2 + pointer.y * 16;
      const radius = Math.min(width * 0.62, height * 0.95);
      const tilt = 0.36 + pointer.y * 0.12;
      const turn = -0.45 + pointer.x * 0.25;
      const cosT = Math.cos(turn);
      const sinT = Math.sin(turn);

      ctx.globalCompositeOperation = "lighter";
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.55);
      halo.addColorStop(0, "rgba(255,214,160,0.55)");
      halo.addColorStop(0.18, "rgba(255,190,140,0.18)");
      halo.addColorStop(0.5, "rgba(120,110,220,0.07)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(turn);
      ctx.scale(1, tilt + 0.1);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (const s of stars) {
        const angle = s.theta + spin * (1.6 - s.r);
        const x = Math.cos(angle) * s.r;
        const y = Math.sin(angle) * s.r * tilt + s.z;
        const px = cx + (x * cosT - y * sinT) * radius;
        const py = cy + (x * sinT + y * cosT) * radius;
        if (px < -4 || py < -4 || px > width + 4 || py > height + 4) continue;
        ctx.fillStyle = `rgba(${s.color},${s.alpha})`;
        ctx.fillRect(px, py, s.size, s.size);
      }

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.08);
      core.addColorStop(0, "rgba(255,248,230,0.95)");
      core.addColorStop(1, "rgba(255,200,140,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.08, 0, Math.PI * 2);
      ctx.fill();

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
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className={className} />;
}
