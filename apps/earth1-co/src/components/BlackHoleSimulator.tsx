"use client";

import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  brightness: number;
  color: string;
}

interface AccretionParticle {
  r: number; // radius from black hole
  theta: number; // angle
  temp: number; // temperature for color (0-1)
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const BH_MASS = 10; // in solar masses for visualization
const G = 1; // Normalized gravitational constant
const C = 1; // Speed of light (normalized)
const SCHWARZSCHILD_RADIUS = 2 * G * BH_MASS / (C * C);

/**
 * Black Hole Simulator with gravitational lensing, accretion disk, and time dilation.
 * Features:
 * - Schwarzschild black hole with event horizon
 * - Photon sphere visualization
 * - Gravitational lensing of starfield
 * - Glowing accretion disk
 * - Time dilation effect
 * - Paused/playing state for exploration
 */
export function BlackHoleSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [showPhotonSphere, setShowPhotonSphere] = useState(true);
  const [showLensing, setShowLensing] = useState(true);
  const [timeScale, setTimeScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reduce motion preference
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animSpeed = reduceMotion ? 0.1 : 1;

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;

    // Generate starfield
    const stars: Star[] = [];
    const starCount = 300;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * w * 2,
        y: (Math.random() - 0.5) * h * 2,
        z: Math.random() * 2,
        brightness: Math.random() * 0.7 + 0.3,
        color: ["#fff", "#ffe6cc", "#ccddff"][Math.floor(Math.random() * 3)],
      });
    }

    // Accretion disk particles
    const accretes: AccretionParticle[] = [];
    for (let i = 0; i < 200; i++) {
      accretes.push({
        r: SCHWARZSCHILD_RADIUS * 3 + Math.random() * 5,
        theta: Math.random() * Math.PI * 2,
        temp: 0.5 + Math.random() * 0.5,
      });
    }

    let time = 0;
    let frameCount = 0;

    const render = () => {
      if (paused || reduceMotion) {
        frameCount += 1;
      } else {
        time += 0.002 * animSpeed * timeScale;
        frameCount += 1;
      }

      // Clear background
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      // Draw background stars
      stars.forEach((star) => {
        // Apply perspective
        const scale = 1 / (1 + star.z * 0.5);
        const screenX = cx + star.x * scale;
        const screenY = cy + star.y * scale;

        // Cull off-screen
        if (screenX < -50 || screenX > w + 50 || screenY < -50 || screenY > h + 50) {
          return;
        }

        // Gravitational lensing distortion
        let lensedX = screenX - cx;
        let lensedY = screenY - cy;
        const dist2 = lensedX * lensedX + lensedY * lensedY;
        const dist = Math.sqrt(dist2);

        if (showLensing && dist > 0) {
          const factor = 1 + 500 / (dist2 + 200);
          lensedX *= factor;
          lensedY *= factor;
        }

        const finalX = cx + lensedX;
        const finalY = cy + lensedY;

        // Brightness accounts for time dilation
        const brightness = star.brightness * Math.max(0.1, 1 - dist * 0.001);
        const size = Math.max(0.5, 1.5 * scale);

        ctx.fillStyle = star.color;
        ctx.globalAlpha = brightness;
        ctx.beginPath();
        ctx.arc(finalX, finalY, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Photon sphere (innermost circular orbit of light)
      const photonR = SCHWARZSCHILD_RADIUS * 1.5;
      if (showPhotonSphere) {
        ctx.strokeStyle = "#ff9f1c";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(cx, cy, photonR * 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Accretion disk
      accretes.forEach((p, i) => {
        // Keplerian orbital motion
        const v_orbital = Math.sqrt(G * BH_MASS / p.r);
        const angular_momentum = p.r * v_orbital;
        p.theta += (angular_momentum / (p.r * p.r)) * 0.005 * animSpeed * timeScale;

        // Inspiral (slow decay into black hole)
        p.r -= 0.001 * animSpeed * timeScale;

        // Regenerate at outer edge when it falls in
        if (p.r < SCHWARZSCHILD_RADIUS * 2) {
          p.r = SCHWARZSCHILD_RADIUS * 8;
          p.theta = Math.random() * Math.PI * 2;
          p.temp = 0.5 + Math.random() * 0.5;
        }

        // Draw accretion disk particle
        const x = cx + Math.cos(p.theta) * p.r * 30;
        const y = cy + Math.sin(p.theta) * p.r * 30;

        // Temperature-based color: red -> yellow -> white
        let color = "#ff0000";
        if (p.temp > 0.6) color = "#ffff00";
        if (p.temp > 0.8) color = "#ffffff";

        const brightness = 0.4 + p.temp * 0.6;
        const size = 1.5 + p.temp * 2;

        ctx.fillStyle = color;
        ctx.globalAlpha = brightness;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Event horizon (Schwarzschild radius)
      const horizonRadius = SCHWARZSCHILD_RADIUS * 30;
      ctx.fillStyle = "#000";
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(cx, cy, horizonRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Event horizon glow
      const gradient = ctx.createRadialGradient(cx, cy, horizonRadius * 0.8, cx, cy, horizonRadius * 1.2);
      gradient.addColorStop(0, "rgba(255, 100, 0, 0.3)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, horizonRadius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Time dilation info display
      const timedilationFactor = 1 / Math.sqrt(Math.max(0.1, 1 - 2 * SCHWARZSCHILD_RADIUS / (SCHWARZSCHILD_RADIUS * 10)));
      const timeString = timedilationFactor.toFixed(1);
      ctx.fillStyle = "#0f0";
      ctx.font = "12px monospace";
      ctx.globalAlpha = 0.7;
      ctx.fillText(`Time dilation: ${timeString}x at photon sphere`, 10, h - 20);
      ctx.globalAlpha = 1;
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => {
      clearInterval(animationId);
    };
  }, [paused, showPhotonSphere, showLensing, timeScale]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspect: "640 / 480" }}
        />
        <figcaption className="sr-only">
          Interactive black hole simulator showing Schwarzschild geometry, gravitational lensing,
          accretion disk, and time dilation effects.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="toggle"
            onClick={() => setPaused(!paused)}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            className={`toggle ${showPhotonSphere ? "active" : ""}`}
            onClick={() => setShowPhotonSphere(!showPhotonSphere)}
          >
            Photon Sphere
          </button>
          <button
            type="button"
            className={`toggle ${showLensing ? "active" : ""}`}
            onClick={() => setShowLensing(!showLensing)}
          >
            Lensing
          </button>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <span className="text-sm">Speed:</span>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={timeScale}
              onChange={(e) => setTimeScale(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm">{timeScale.toFixed(1)}×</span>
          </label>
        </div>

        <p className="source text-sm leading-relaxed">
          This simulator shows a Schwarzschild black hole with mass ~10 M☉. The black disk is the
          event horizon; within it, not even light escapes. The orange circle shows the photon
          sphere where light orbits unstably. The red-yellow accretion disk glows as matter spirals
          inward, converting gravitational potential energy to heat. Notice how starlight bends
          around the black hole—this is gravitational lensing. The green text shows time dilation:
          near the photon sphere, time runs much slower than far away.
        </p>
      </div>
    </div>
  );
}
