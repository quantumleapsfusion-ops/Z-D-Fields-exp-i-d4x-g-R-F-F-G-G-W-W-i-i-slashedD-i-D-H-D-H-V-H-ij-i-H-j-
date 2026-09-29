"use client";

import { useEffect, useRef } from "react";

/**
 * A ruled sheet whose lines bend because something heavy sits on it.
 *
 * Nothing here is keyframed. A body orbits the sheet's centre under an inverse-square
 * force (leapfrog integration, softened so the orbit never blows up), the pointer adds a
 * damped spring pull so a visitor can drag the mass around, and every grid vertex is
 * displaced towards the body by the weak-field lensing deflection α = 4GM / (c²b), i.e.
 * proportional to 1 / impact parameter. The loop stops when the tab is hidden, when the
 * canvas is offscreen, and under prefers-reduced-motion (one static frame is drawn).
 */
export function Spacetime({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let dpr = 1;
    const spacing = 44;

    // Body state (CSS px). Starts on a mild ellipse around the centre.
    const body = { x: 0, y: 0, vx: 0, vy: 0 };
    const centreMass = 1.6e5; // GM in px³/s²; sets the orbital period
    const softening = 60;
    const pointer = { x: 0, y: 0, active: false };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      // Cap the backing store (~4 Mpx) so very tall viewports don't allocate a huge bitmap.
      dpr = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(4e6 / (width * height)));
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (body.x === 0 && body.y === 0) {
        const r = Math.min(width, height) * 0.28;
        body.x = width * 0.62 + r;
        body.y = height * 0.42;
        // circular-orbit speed v = sqrt(GM / r), slightly under so the orbit is elliptical
        const v = Math.sqrt(centreMass / r) * 0.92;
        body.vx = 0;
        body.vy = v;
      }
    }

    function accelerate(x: number, y: number) {
      const cx = width * 0.62;
      const cy = height * 0.42;
      let dx = cx - x;
      let dy = cy - y;
      const r2 = dx * dx + dy * dy + softening * softening;
      const inv = centreMass / (r2 * Math.sqrt(r2));
      let ax = dx * inv;
      let ay = dy * inv;
      if (pointer.active) {
        // damped spring towards the pointer: k = 3 s⁻², c = 2.4 s⁻¹
        dx = pointer.x - x;
        dy = pointer.y - y;
        ax += dx * 3 - body.vx * 2.4;
        ay += dy * 3 - body.vy * 2.4;
      }
      return [ax, ay] as const;
    }

    function step(dt: number) {
      // kick–drift–kick leapfrog
      let [ax, ay] = accelerate(body.x, body.y);
      body.vx += 0.5 * ax * dt;
      body.vy += 0.5 * ay * dt;
      body.x += body.vx * dt;
      body.y += body.vy * dt;
      [ax, ay] = accelerate(body.x, body.y);
      body.vx += 0.5 * ax * dt;
      body.vy += 0.5 * ay * dt;
    }

    function deflect(px: number, py: number) {
      const dx = body.x - px;
      const dy = body.y - py;
      const b = Math.hypot(dx, dy);
      // α ∝ 1/b, capped inside the "photon sphere" so vertices never cross the body
      const alpha = Math.min(0.55 * b, 2600 / Math.max(b, 1));
      return [px + (dx / (b || 1)) * alpha, py + (dy / (b || 1)) * alpha] as const;
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = "rgba(236, 230, 218, 0.10)";
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;
      const ox = (width % spacing) / 2 - spacing;
      const oy = (height % spacing) / 2 - spacing;

      ctx!.beginPath();
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const [x, y] = deflect(ox + i * spacing, oy + j * spacing);
          if (i === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
      }
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const [x, y] = deflect(ox + i * spacing, oy + j * spacing);
          if (j === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
      }
      ctx!.stroke();

      // the body itself: a small ink dot, like a compass point pressed into the page
      ctx!.fillStyle = "rgba(236, 230, 218, 0.55)";
      ctx!.beginPath();
      ctx!.arc(body.x, body.y, 2.2, 0, Math.PI * 2);
      ctx!.fill();
    }

    let raf = 0;
    let last = 0;
    let visible = true;
    let onscreen = true;

    function frame(t: number) {
      raf = 0;
      if (!visible || !onscreen) return;
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
      last = t;
      // sub-step for stability when the spring is engaged
      for (let k = 0; k < 4; k++) step(dt / 4);
      draw();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduced.matches) {
        draw();
        return;
      }
      if (!raf && visible && onscreen) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced.matches) draw();
    });
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(
      ([entry]) => {
        onscreen = entry?.isIntersecting ?? true;
        if (onscreen) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      if (visible) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onMove = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = e.pointerType === "mouse" || e.buttons > 0;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onLeave, { passive: true });
    window.addEventListener("pointercancel", onLeave, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const onReduced = () => {
      stop();
      start();
    };
    reduced.addEventListener("change", onReduced);

    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onLeave);
      window.removeEventListener("pointercancel", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      reduced.removeEventListener("change", onReduced);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
