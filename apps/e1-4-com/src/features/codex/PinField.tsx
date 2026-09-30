"use client";

import { useMemo } from "react";
import { LiquidMetal, type ShapeFn } from "@earth-one/liquid-metal";

import { watchTilt } from "@/lib/device/tilt";
import type { Form } from "@/lib/gravity/superposition";
import { BANDS, FRAMES, type SoundPrint, WAVE_POINTS } from "@/lib/sound/analyse";

/** Bead grid for a landscape screen; portrait screens swap the two so the field is always tall enough. */
const LONG = 168;
const SHORT = 102;
const PITCH = 0.043;

/**
 * `rest` is Saturn turning slowly in the pool, `listen` is the live level, `line` raises the
 * waveform as one ridge, `board` inks the spectrogram low across the metal, `relief` lifts it
 * into hills by loudness, `well` sinks it into a black hole behind a rim, `form` shows a shape.
 * All of these are only targets: the liquid (`@earth-one/liquid-metal`) flows toward them.
 */
export type PinPhase = "rest" | "listen" | "line" | "board" | "relief" | "well" | "form";

function formHeight(form: Form, u: number, v: number): number {
  const r = Math.hypot(u, v);
  const a = Math.atan2(v, u);
  switch (form) {
    case "sphere":
      return Math.sqrt(Math.max(0, 1 - (r * r) / 0.55));
    case "torus":
      return Math.exp(-((r - 0.55) ** 2) / 0.02);
    case "wave":
      return 0.5 + 0.5 * Math.sin(u * 6) * Math.cos(v * 4);
    case "spiral":
      return Math.max(0, Math.cos(a * 3 - r * 14)) * Math.max(0, 1 - r);
    case "lattice":
      return Math.sin(u * 9) > 0 !== Math.sin(v * 9) > 0 ? 0.7 : 0.08;
    case "knot":
      return (
        0.5 +
        0.5 *
          Math.sin(u * 5 + Math.sin(v * 5) * 2) *
          Math.cos(v * 5 + Math.sin(u * 5) * 2)
      );
  }
}

function lineHeight(print: SoundPrint, u: number, y: number): number {
  const w = print.waveform[Math.min(WAVE_POINTS - 1, Math.floor(u * WAVE_POINTS))];
  return w * 0.9 * Math.exp(-(y * y) / (0.01 + w * 0.5));
}

function wellHeight(r: number, a: number, now: number): number {
  const plateau = 0.55 * (1 - Math.exp(-(r * r) / 0.8));
  const rim = 0.4 * Math.exp(-((r - 1.05) ** 2) / 0.006);
  const swirl = 0.06 * Math.sin(a * 3 + now * 2.2 - r * 5) * Math.min(1, r);
  return plateau + rim + swirl;
}

const RING_BANDS = [
  { inner: 0.78, outer: 0.98, height: 0.18 },
  { inner: 1.02, outer: 1.42, height: 0.3 },
  { inner: 1.52, outer: 1.78, height: 0.22 },
  { inner: 1.84, outer: 1.9, height: 0.12 },
];

/** Saturn at rest: a planet swelling from the centre, circled by bright ring bands and gaps. */
function saturnHeight(r: number, a: number, now: number): number {
  const planet = r < 0.62 ? 0.95 * Math.sqrt(1 - (r / 0.62) ** 2) : 0;
  let ring = 0;
  for (const band of RING_BANDS) {
    if (r < band.inner || r > band.outer) continue;
    const t = (r - band.inner) / (band.outer - band.inner);
    const edge = Math.sin(Math.PI * t) ** 0.4;
    const ringlets = 0.75 + 0.25 * Math.sin(r * 90);
    const orbit = 0.85 + 0.15 * Math.sin(a * 2 - now * (0.9 / r));
    ring = band.height * edge * ringlets * orbit;
  }
  return planet + ring;
}

function reliefHeight(print: SoundPrint, u: number, v: number): number {
  const frame = Math.min(FRAMES - 1, Math.floor(u * FRAMES));
  const band = Math.min(BANDS - 1, Math.floor(v * BANDS));
  return print.spectrogram[frame][band] ** 2 * (0.35 + print.loudness[frame] * 0.65);
}

/** Slow swell that travels across the pool so it never sits still, whatever the phase. */
function tide(x: number, y: number, now: number): number {
  return (
    0.05 +
    0.035 * Math.sin(now * 0.8 + x * 1.3 + y * 0.9) +
    0.02 * Math.sin(now * 0.47 - x * 0.7 + y * 1.6)
  );
}

/**
 * A pool of liquid metal that shows the voice. Phase, sound print and form only choose the
 * shape the metal is pulled toward; the fluid does the moving.
 */
export default function PinField({
  phase,
  level = 0,
  print,
  form = "sphere",
  pulse = 0,
}: {
  phase: PinPhase;
  level?: number;
  print?: SoundPrint | null;
  form?: Form;
  /** Bump to send a wave through the metal, e.g. on every spoken word. */
  pulse?: number;
}) {
  const shape = useMemo<ShapeFn>(
    () => (x, y, now, u, v) => {
      const r = Math.hypot(x, y);
      const a = Math.atan2(y, x);
      const base = tide(x, y, now);
      switch (phase) {
        case "rest":
          return base * 0.5 + saturnHeight(r, a, now);
        case "listen":
          return base;
        case "line":
          return print ? base + lineHeight(print, u, y) : base;
        case "board":
          return print ? base + reliefHeight(print, u, v) * 0.3 : base;
        case "relief":
          return print ? base + reliefHeight(print, u, v) : base;
        case "well":
          return wellHeight(r, a, now);
        case "form":
          return base + formHeight(form, x / 2.2, y / 2.2) * 0.9;
      }
    },
    [phase, print, form],
  );

  return (
    <LiquidMetal
      shape={shape}
      pulse={pulse}
      level={phase === "listen" ? level : 0}
      cols={LONG}
      rows={SHORT}
      pitch={PITCH}
      autoOrient
      cover
      tilt={watchTilt}
    />
  );
}
