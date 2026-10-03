"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  Msun,
  blackHolePresets,
  evaporationTimeYears,
  hawkingTemperature,
  isco,
  lightDeflection,
  photonSphere,
  schwarzschildRadius,
  timeDilation,
} from "@/lib/explore/blackhole";

type ParticleCounts = { captured: number; escaped: number };
type Particle = { x: number; y: number; vx: number; vy: number; age: number };
type Star = { x: number; y: number; radius: number; alpha: number };

function BlackHoleCanvas({
  massKg,
  onCounts,
}: {
  massKg: number;
  onCounts: React.Dispatch<React.SetStateAction<ParticleCounts>>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropRef = useRef<((x: number, y: number) => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = 1;
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = performance.now();
    let rotation = 0;
    const particles: Particle[] = [];
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    const stars: Star[] = Array.from({ length: 130 }, (_, index) => {
      const a = (index * 2.399963) % (Math.PI * 2);
      const r = 0.04 + (((index * 79) % 997) / 997) * 0.49;
      return {
        x: 0.5 + Math.cos(a) * r,
        y: 0.5 + Math.sin(a) * r,
        radius: 0.6 + ((index * 13) % 14) / 10,
        alpha: 0.3 + ((index * 31) % 70) / 100,
      };
    });
    const drawStar = (x: number, y: number, star: Star, magnification: number) => {
      const radius = Math.min(
        3.2,
        star.radius * (0.65 + Math.log1p(magnification) * 0.48),
      );
      ctx.globalAlpha = Math.min(
        1,
        star.alpha * (0.45 + Math.log1p(magnification) * 0.38),
      );
      ctx.fillStyle = "#e4edff";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const render = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      if (!reduceMotion) rotation += dt * (0.32 + Math.log10(massKg / Msun + 1) * 0.035);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const radiusScene = 0.055 * Math.min(width, height);
      const gmScene = radiusScene / 2;
      const lensRadius = Math.max(22, Math.min(width, height) * 0.18);
      const centerX = width / 2;
      const centerY = height / 2;
      const background = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(width, height) * 0.7,
      );
      background.addColorStop(0, "#12101b");
      background.addColorStop(1, "#030409");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        const sx = star.x * width;
        const sy = star.y * height;
        const dx = sx - centerX;
        const dy = sy - centerY;
        const beta = Math.hypot(dx, dy) / lensRadius;
        const u = Math.max(beta, 0.025);
        const root = Math.sqrt(u * u + 4);
        const thetaPlus = (u + root) / 2;
        const thetaMinus = (u - root) / 2;
        const magnificationOffset = (u * u + 2) / (2 * u * root);
        const muPlus = 0.5 + magnificationOffset;
        const muMinus = Math.max(0.02, magnificationOffset - 0.5);
        const angle = Math.atan2(dy, dx);
        drawStar(
          centerX + Math.cos(angle) * thetaPlus * lensRadius,
          centerY + Math.sin(angle) * thetaPlus * lensRadius,
          star,
          muPlus,
        );
        drawStar(
          centerX + Math.cos(angle) * thetaMinus * lensRadius,
          centerY + Math.sin(angle) * thetaMinus * lensRadius,
          star,
          muMinus,
        );
      }

      const rs = radiusScene;
      const shadowRadius = (Math.sqrt(27) / 2) * rs;
      const diskOuter = rs * 9.2;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.22);
      ctx.scale(1, 0.34);
      const disk = ctx.createRadialGradient(0, 0, rs * 3, 0, 0, diskOuter);
      disk.addColorStop(0, "rgba(255,185,82,0.03)");
      disk.addColorStop(0.35, "rgba(255,135,45,0.88)");
      disk.addColorStop(0.62, "rgba(255,219,131,0.77)");
      disk.addColorStop(0.82, "rgba(226,77,32,0.52)");
      disk.addColorStop(1, "rgba(96,30,46,0.02)");
      ctx.fillStyle = disk;
      ctx.beginPath();
      ctx.ellipse(0, 0, diskOuter, diskOuter, 0, rotation, Math.PI * 2 + rotation);
      ctx.fill();
      for (let i = 0; i < 5; i += 1) {
        ctx.strokeStyle = `rgba(255,${185 + i * 12},${115 + i * 14},${0.22 - i * 0.025})`;
        ctx.lineWidth = Math.max(1, rs * 0.055);
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          rs * (3.4 + i * 1.05),
          rs * (3.4 + i * 1.05),
          0,
          rotation + i * 0.09,
          rotation + Math.PI * 2 + i * 0.09,
        );
        ctx.stroke();
      }
      const beaming = ctx.createLinearGradient(-diskOuter, 0, diskOuter, 0);
      beaming.addColorStop(0, "rgba(255,246,196,0.72)");
      beaming.addColorStop(0.5, "rgba(255,188,89,0.04)");
      beaming.addColorStop(1, "rgba(174,54,31,0.38)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = beaming;
      ctx.beginPath();
      ctx.ellipse(0, 0, diskOuter, diskOuter, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const photonGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        shadowRadius * 1.02,
        centerX,
        centerY,
        shadowRadius * 1.35,
      );
      photonGlow.addColorStop(0, "rgba(255,215,137,0)");
      photonGlow.addColorStop(0.72, "rgba(255,205,122,0.5)");
      photonGlow.addColorStop(1, "rgba(255,205,122,0)");
      ctx.fillStyle = photonGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, shadowRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,223,156,0.86)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, shadowRadius * 1.04, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(182,201,255,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, lensRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#010104";
      ctx.beginPath();
      ctx.arc(centerX, centerY, shadowRadius, 0, Math.PI * 2);
      ctx.fill();

      // A bent foreground segment approximates disk light lensed over the shadow.
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.22);
      ctx.scale(1, 0.34);
      ctx.strokeStyle = "rgba(255,213,132,0.92)";
      ctx.lineWidth = Math.max(2, rs * 0.28);
      ctx.shadowColor = "#ff9c45";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        shadowRadius * 1.13,
        shadowRadius * 1.13,
        0,
        Math.PI * 1.13,
        Math.PI * 1.87,
      );
      ctx.stroke();
      ctx.restore();

      if (!reduceMotion) {
        const acceleration = (x: number, y: number) => {
          const r = Math.hypot(x, y);
          const safeR = Math.max(r, rs * 1.01);
          const magnitude = -gmScene / (safeR - rs) ** 2 / safeR;
          return { x: magnitude * x, y: magnitude * y };
        };
        const step = Math.min(0.12, dt * 8);
        for (let index = particles.length - 1; index >= 0; index -= 1) {
          const p = particles[index];
          const a0 = acceleration(p.x, p.y);
          const nx = p.x + p.vx * step + 0.5 * a0.x * step * step;
          const ny = p.y + p.vy * step + 0.5 * a0.y * step * step;
          const a1 = acceleration(nx, ny);
          p.vx += 0.5 * (a0.x + a1.x) * step;
          p.vy += 0.5 * (a0.y + a1.y) * step;
          p.x = nx;
          p.y = ny;
          p.age += dt;
          const r = Math.hypot(p.x, p.y);
          if (r < rs) {
            particles.splice(index, 1);
            onCounts((count) => ({ ...count, captured: count.captured + 1 }));
            continue;
          }
          if (r > Math.max(width, height) * 0.65 && p.age > 0.3) {
            particles.splice(index, 1);
            onCounts((count) => ({ ...count, escaped: count.escaped + 1 }));
            continue;
          }
          ctx.globalAlpha = Math.max(0.1, 1 - p.age / 14);
          ctx.fillStyle = "#fff2b0";
          ctx.shadowColor = "#ffa347";
          ctx.shadowBlur = 9;
          ctx.beginPath();
          ctx.arc(centerX + p.x, centerY + p.y, 2.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
      } else {
        for (const particle of particles) {
          ctx.fillStyle = "#fff2b0";
          ctx.beginPath();
          ctx.arc(centerX + particle.x, centerY + particle.y, 2.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!reduceMotion) frame = requestAnimationFrame(render);
    };

    dropRef.current = (x, y) => {
      const radius = Math.hypot(x, y) || 1;
      particles.push({
        x,
        y,
        vx: (x / radius) * 1.2,
        vy: (y / radius) * 1.2,
        age: 0,
      });
      if (reduceMotion) frame = requestAnimationFrame(render);
    };
    resize();
    frame = requestAnimationFrame(render);
    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) frame = requestAnimationFrame(render);
    });
    observer.observe(canvas);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      dropRef.current = null;
    };
  }, [massKg, onCounts]);

  const dropAt = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = rect.width;
    const height = rect.height;
    dropRef.current?.(clientX - rect.left - width / 2, clientY - rect.top - height / 2);
  };

  return (
    <canvas
      ref={canvasRef}
      aria-label="Black-hole lensing simulation. Click or tap to drop a test particle; use the Drop particle button for keyboard access."
      onPointerDown={(event) => dropAt(event.clientX, event.clientY)}
      className="h-[24rem] w-full cursor-crosshair touch-manipulation rounded-sm border border-white/15 sm:h-[30rem]"
    />
  );
}

function formatDistance(metres: number) {
  return metres >= 1.496e11
    ? `${(metres / 1.496e11).toPrecision(4)} AU`
    : `${(metres / 1000).toPrecision(4)} km`;
}

export function BlackHoleSim() {
  const [massSolar, setMassSolar] = useState(10);
  const [logMass, setLogMass] = useState(Math.log10(10));
  const [clockRadius, setClockRadius] = useState(2);
  const [counts, setCounts] = useState<ParticleCounts>({ captured: 0, escaped: 0 });
  const massKg = massSolar * Msun;
  const rs = schwarzschildRadius(massKg);
  const dilation = timeDilation(clockRadius);
  const setMass = (solarMasses: number) => {
    setMassSolar(solarMasses);
    setLogMass(Math.log10(solarMasses));
    setCounts({ captured: 0, escaped: 0 });
  };
  const onCounts = useCallback<React.Dispatch<React.SetStateAction<ParticleCounts>>>(
    (update) => setCounts(update),
    [],
  );
  const dropParticle = () => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      '[aria-label^="Black-hole lensing"]',
    );
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: rect.left + rect.width * 0.78,
        clientY: rect.top + rect.height * 0.5,
      }),
    );
  };

  return (
    <div className="mt-8">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {blackHolePresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={
              Math.abs(massSolar - preset.massSolar) / preset.massSolar < 1e-9
            }
            onClick={() => setMass(preset.massSolar)}
            className="toggle text-left"
            title={preset.note}
          >
            {preset.name}
          </button>
        ))}
      </div>
      <label className="mt-5 block">
        <span className="label flex justify-between">
          <span>Mass</span>
          <span>{massSolar.toExponential(2)} M☉</span>
        </span>
        <input
          type="range"
          aria-label="Black-hole mass on a logarithmic scale, in solar masses"
          min="-1"
          max="11"
          step="0.01"
          value={logMass}
          onChange={(event) => {
            const exponent = Number(event.target.value);
            setLogMass(exponent);
            setMassSolar(10 ** exponent);
            setCounts({ captured: 0, escaped: 0 });
          }}
          className="mt-3 w-full accent-white"
        />
        <span className="source flex justify-between">
          <span>0.1 M☉</span>
          <span>10¹¹ M☉</span>
        </span>
      </label>
      <BlackHoleCanvas key={massSolar} massKg={massKg} onCounts={onCounts} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="toggle" onClick={dropParticle}>
          Drop a test particle
        </button>
        <p className="source" aria-live="polite">
          Captured: {counts.captured} · Escaped: {counts.escaped}
        </p>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <dl className="grid grid-cols-2 gap-4 border border-white/15 p-4 font-sans text-sm">
          <div>
            <dt className="text-white/55">Schwarzschild radius</dt>
            <dd className="mt-1">{formatDistance(rs)}</dd>
          </div>
          <div>
            <dt className="text-white/55">Photon sphere</dt>
            <dd className="mt-1">{formatDistance(photonSphere(massKg))}</dd>
          </div>
          <div>
            <dt className="text-white/55">ISCO (non-spinning)</dt>
            <dd className="mt-1">{formatDistance(isco(massKg))}</dd>
          </div>
          <div>
            <dt className="text-white/55">Hawking temperature</dt>
            <dd className="mt-1">{hawkingTemperature(massKg).toExponential(3)} K</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-white/55">Evaporation time (idealised)</dt>
            <dd className="mt-1">
              {evaporationTimeYears(massKg).toExponential(3)} years
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-white/55">Weak-field deflection, b = 10 rₛ</dt>
            <dd className="mt-1">
              {(lightDeflection(10 * rs, massKg) * (180 / Math.PI) * 3600).toPrecision(4)}{" "}
              arcseconds
            </dd>
          </div>
        </dl>
        <div className="border border-white/15 p-4">
          <label htmlFor="clock-radius" className="label flex justify-between">
            <span>Clock radius</span>
            <span>{clockRadius.toFixed(2)} rₛ</span>
          </label>
          <input
            id="clock-radius"
            type="range"
            min="1.01"
            max="10"
            step="0.01"
            value={clockRadius}
            onChange={(event) => setClockRadius(Number(event.target.value))}
            className="mt-4 w-full accent-white"
          />
          <p className="mt-5 text-lg">
            {dilation === null
              ? "No stationary clock can remain at or inside the horizon."
              : `1 hour there = ${(1 / dilation).toFixed(3)} hours far away.`}
          </p>
          <p className="source mt-2">
            A clock held at rest deeper in the gravitational field runs slower relative to
            a distant observer.
          </p>
        </div>
      </div>
    </div>
  );
}
