"use client";

import { useMemo } from "react";
import { LiquidMetal, type ShapeFn } from "@earth-one/liquid-metal";

import { type Body, orbiting, step } from "@/lib/newton";

/** Orbit radius, launch-speed boost (eccentricity) and relief size for the eight planets. */
const PLANETS = [
  { orbit: 0.72, boost: 1.06, size: 0.07, height: 0.3 },
  { orbit: 1.02, boost: 1.01, size: 0.1, height: 0.42 },
  { orbit: 1.36, boost: 1.0, size: 0.11, height: 0.45 },
  { orbit: 1.74, boost: 1.04, size: 0.09, height: 0.36 },
  { orbit: 2.45, boost: 1.02, size: 0.24, height: 0.95 },
  { orbit: 3.2, boost: 1.03, size: 0.2, height: 0.8, rings: true },
  { orbit: 3.85, boost: 1.01, size: 0.15, height: 0.6 },
  { orbit: 4.4, boost: 1.0, size: 0.15, height: 0.56 },
];

/** Scene units → field units so Neptune's orbit fits the pool's short side. */
const SCALE = 0.44;
const SUBSTEPS = 4;

type Planet = Body & (typeof PLANETS)[number];

/** Builds the shape function; it owns the orbiting bodies and advances them as time moves on. */
export function solarRelief(): ShapeFn {
  const planets: Planet[] = PLANETS.map((p, i) => ({
    ...p,
    ...orbiting(p.orbit, (i * 2.39996 + 0.7) % (Math.PI * 2), p.boost),
  }));
  let simulated = 0;
  return (x, y, t) => {
    // Advance the orbits once per frame, on the first bead that sees a new time.
    if (t > simulated) {
      const dt = Math.min(0.1, t - simulated) / SUBSTEPS;
      for (let s = 0; s < SUBSTEPS; s += 1) for (const p of planets) step(p, dt);
      simulated = t;
    }
    const r = Math.hypot(x, y);
    // The Sun: a broad dome the whole pool slopes up to.
    let h = 1.1 * Math.exp(-(r * r) / 0.09) + 0.1 * Math.exp(-(r * r) / 1.2);
    // Slow tide so nothing ever sits perfectly still.
    h += 0.03 * Math.sin(t * 0.6 + x * 1.1 - y * 0.8);
    for (const p of planets) {
      const px = p.x * SCALE;
      const py = p.y * SCALE;
      const d2 = (x - px) ** 2 + (y - py) ** 2;
      h += p.height * Math.exp(-d2 / (p.size * p.size));
      if (p.rings) {
        const d = Math.sqrt(d2);
        h += 0.28 * Math.exp(-((d - p.size * 1.9) ** 2) / 0.004);
      }
      // The orbit groove: the track each planet has worn into the metal.
      h -= 0.035 * Math.exp(-((r - p.orbit * SCALE) ** 2) / 0.0012);
    }
    return h;
  };
}

/**
 * The Solar System as relief in a pool of liquid metal. Planets are Newtonian bodies
 * (velocity-Verlet, see lib/newton) whose positions push the metal up into bulges; the Sun
 * is a broad swell at the centre and each orbit leaves a shallow groove. The pool itself is
 * a wave-equation fluid, so every bulge trails ripples as it moves.
 */
export function MetalSystem() {
  const shape = useMemo(() => solarRelief(), []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <LiquidMetal shape={shape} className="pointer-events-auto h-full w-full" />
      <div
        className="absolute inset-x-0 bottom-0 h-3/5"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.92) 35%, rgba(0,0,0,0))",
        }}
      />
    </div>
  );
}
