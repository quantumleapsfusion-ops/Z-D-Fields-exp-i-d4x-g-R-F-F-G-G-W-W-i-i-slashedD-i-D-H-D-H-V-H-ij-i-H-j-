"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LiquidMetal, type ShapeFn, type TintFn } from "@earth-one/liquid-metal";

import {
  loadLogoMask,
  type LogoMask,
  logoAspect,
  sampleMask,
} from "@/features/codex/beadLogo";
import { watchTilt } from "@/lib/device/tilt";
import type { Form } from "@/lib/gravity/superposition";
import { BANDS, FRAMES, type SoundPrint, WAVE_POINTS } from "@/lib/sound/analyse";

/** Bead grid for a landscape screen; portrait screens swap the two so the field is always tall enough. */
const LONG = 240;
const SHORT = 146;
const PITCH = 0.03;
/** Share of the full grid a phone starts with; it drops further if frames still run long. */
const PHONE_DENSITY = 0.62;
const MIN_DENSITY = 0.4;
/** Half the height of the bead-drawn logo, in world units. */
const LOGO_HALF_H = 0.95;
/** How high the logo stands out of the pool. */
const LOGO_RISE = 0.5;
/** The logo's beads are black chrome against the silver pool. */
const LOGO_INK = 0.14;

/**
 * `rest` is Saturn turning slowly in the pool, `listen` is the live level, `line` raises the
 * waveform as one ridge, `board` inks the spectrogram low across the metal, `relief` lifts it
 * into hills by loudness, `well` sinks it into a black hole behind a rim, `form` shows a shape,
 * `play` sweeps a ridge across the pool in time with a recording and leaves its sound behind.
 * All of these are only targets: the liquid (`@earth-one/liquid-metal`) flows toward them.
 */
export type PinPhase =
  "rest" | "listen" | "line" | "board" | "relief" | "well" | "form" | "play";

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

/**
 * A recording playing back: a ridge at the playhead lifts that moment's spectrum out of the metal
 * and the sound already heard stays behind it as low relief.
 */
function playHeight(print: SoundPrint, at: number, u: number, v: number): number {
  const frame = Math.min(FRAMES - 1, Math.floor(at * FRAMES));
  const band = Math.min(BANDS - 1, Math.floor(v * BANDS));
  const d = u - at;
  const ridge =
    Math.exp(-(d * d) / 0.0018) *
    print.spectrogram[frame][band] ** 1.5 *
    (0.35 + print.loudness[frame] * 0.85);
  const heard = u <= at ? reliefHeight(print, u, v) * 0.4 : 0;
  return heard + ridge * 1.1;
}

/** Reads the playhead once per animation frame, however many beads ask for it. */
function perFrame(progress: (() => number) | undefined): (now: number) => number {
  let frameAt = NaN;
  let at = 0;
  return (now) => {
    if (now !== frameAt) {
      frameAt = now;
      at = Math.max(0, Math.min(1, progress?.() ?? 0));
    }
    return at;
  };
}

/** Bead density for this device: phones and small screens start lighter so they hold 60 fps. */
function startingDensity(): number {
  if (typeof window === "undefined") return 1;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return small || coarse ? PHONE_DENSITY : 1;
}

/** Slow swell that travels across the pool so it never sits still, whatever the phase. */
function tide(x: number, y: number, now: number): number {
  return (
    0.05 +
    0.035 * Math.sin(now * 0.8 + x * 1.3 + y * 0.9) +
    0.02 * Math.sin(now * 0.47 - x * 0.7 + y * 1.6)
  );
}

/** Slow spiral arms around the logo; they turn faster while someone speaks. */
function vortexHeight(r: number, a: number, now: number, voice: number): number {
  const arms =
    0.06 * Math.sin(a * 3 - r * 7 + now * (1.2 + voice * 6)) * Math.min(1, r * 1.5);
  return arms * Math.exp(-(r * r) / 6);
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
  logo = false,
  progress,
  levelSource,
}: {
  phase: PinPhase;
  level?: number;
  print?: SoundPrint | null;
  form?: Form;
  /** Bump to send a wave through the metal, e.g. on every spoken word. */
  pulse?: number;
  /** The metal itself draws the e1-4 Ψπ mark at the centre, and it stirs when spoken to. */
  logo?: boolean;
  /** 0..1 through the recording being played, read every frame in the `play` phase. */
  progress?: () => number;
  /** Live level read every frame instead of `level`, e.g. from a playing recording. */
  levelSource?: () => number;
}) {
  const [density, setDensity] = useState(startingDensity);
  const thin = useCallback(
    () => setDensity((d) => (d > MIN_DENSITY ? Math.max(MIN_DENSITY, d * 0.75) : d)),
    [],
  );
  const [mask, setMask] = useState<LogoMask | null>(null);
  useEffect(() => {
    if (!logo) return;
    let live = true;
    loadLogoMask()
      .then((loaded) => {
        if (live) setMask(loaded);
      })
      .catch(() => null);
    return () => {
      live = false;
    };
  }, [logo]);
  const drawn = logo && mask && (phase === "rest" || phase === "listen") ? mask : null;
  const aspect = drawn ? logoAspect(drawn) : 1;
  const voice = phase === "listen" ? Math.min(1, level * 1.8) : 0;
  const shape = useMemo<ShapeFn>(() => {
    const playhead = perFrame(progress);
    return (x, y, now, u, v) => {
      const r = Math.hypot(x, y);
      const a = Math.atan2(y, x);
      const base = tide(x, y, now);
      if (drawn) {
        const v = y / LOGO_HALF_H;
        const wobble = voice * 0.09 * Math.sin(v * 9 - now * 8);
        const ink = sampleMask(drawn, (x * aspect) / LOGO_HALF_H + wobble, v);
        const rise =
          ink * (LOGO_RISE + voice * 0.35 + 0.05 * Math.sin(now * 2.4 + x * 3 + y * 2));
        return base * 0.5 + vortexHeight(r, a, now, voice) + rise;
      }
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
        case "play":
          return print ? base + playHeight(print, playhead(now), u, v) : base;
      }
    };
  }, [phase, print, form, drawn, aspect, voice, progress]);
  const tint = useMemo<TintFn | undefined>(
    () =>
      drawn
        ? (x, y, out) => {
            const u = (x * aspect) / LOGO_HALF_H;
            const v = y / LOGO_HALF_H;
            const ink = sampleMask(drawn, u, v);
            out.fill(LOGO_INK);
            return ink;
          }
        : undefined,
    [drawn, aspect],
  );

  return (
    <LiquidMetal
      shape={shape}
      tint={tint}
      pulse={pulse}
      level={phase === "listen" ? level : 0}
      levelSource={levelSource}
      onSlow={thin}
      cols={Math.round(LONG * density)}
      rows={Math.round(SHORT * density)}
      pitch={PITCH / density}
      autoOrient
      cover
      tilt={watchTilt}
    />
  );
}
