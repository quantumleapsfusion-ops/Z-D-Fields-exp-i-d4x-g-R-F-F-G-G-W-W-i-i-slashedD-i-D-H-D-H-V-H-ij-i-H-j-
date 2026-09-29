"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { COUNT, GRID } from "@/features/gravity/grid";
import type { Shape } from "@/features/gravity/TopologyCollapse";
import { useCarry } from "@/lib/carry";
import { EVENT_HORIZON } from "@/lib/gravity/superposition";
import { STAGES, type StageId, nextStage, stageDuration } from "@/lib/journey";
import { BANDS, FRAMES, type SoundPrint } from "@/lib/sound/analyse";
import { type SoundReading, readSound, soundDensity } from "@/lib/sound/reading";

const TopologyCollapse = dynamic(() => import("@/features/gravity/TopologyCollapse"), {
  ssr: false,
});

const CYCLE_MS = 1400;

/** Height per board particle: time runs across the board, pitch bands run up it. */
function reliefOf(print: SoundPrint): number[] {
  return Array.from({ length: COUNT }, (_, i) => {
    const frame = Math.min(FRAMES - 1, Math.floor(((i % GRID) / GRID) * FRAMES));
    const band = Math.min(BANDS - 1, Math.floor((Math.floor(i / GRID) / GRID) * BANDS));
    return print.spectrogram[frame][band] ** 2 * (0.4 + print.loudness[frame] * 0.6);
  });
}

/**
 * The stream's single path upward, drawn from the sound itself: its waveform, its spectrogram,
 * the spectrogram as terrain, the well, and the shapes it could take. Each stage runs on a timer
 * and hands over to the next; nothing waits on a click.
 */
export function Journey() {
  const [print] = useState(() => useCarry.getState().sound);
  const reading = useMemo(() => (print ? readSound(print) : null), [print]);
  const relief = useMemo(() => (print ? reliefOf(print) : undefined), [print]);
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const stage = STAGES[index];

  useEffect(() => {
    if (!print) return;
    const ms = stageDuration(stage.id);
    if (ms === null) return;
    const timer = setTimeout(() => setIndex((current) => nextStage(current)), ms);
    return () => clearTimeout(timer);
  }, [print, stage.id]);

  useEffect(() => {
    if (stage.id !== "superposition") return;
    const timer = setInterval(() => setCycle((current) => current + 1), CYCLE_MS);
    return () => clearInterval(timer);
  }, [stage.id]);

  if (!print || !reading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-dust text-2xl">Your stream is silent.</p>
        <Link href="/" className="text-ochre font-sans text-sm">
          Speak
        </Link>
      </main>
    );
  }

  const { candidates } = reading;
  const observed = candidates[reading.resolvedIndex];
  const shape = shapeFor(
    stage.id,
    candidates[cycle % candidates.length].form,
    observed.form,
  );
  const drawn = stage.id === "voice" || stage.id === "board";

  return (
    <main className="relative h-screen overflow-hidden bg-black">
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${drawn ? "opacity-0" : "opacity-100"}`}
      >
        <TopologyCollapse
          form={shape}
          seed={`${Math.round(print.centroidHz)}:${Math.round(print.durationMs)}`}
          core={index >= STAGES.findIndex((s) => s.id === "horizon")}
          relief={relief}
        />
      </div>

      {stage.id === "voice" ? (
        <SoundCanvas key="wave" print={print} mode="wave" revealMs={3500} />
      ) : null}
      {stage.id === "board" ? (
        <SoundCanvas key="spectrogram" print={print} mode="spectrogram" revealMs={5000} />
      ) : null}

      <header className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-3 px-6 pt-8 sm:px-10">
        <ol className="flex gap-4" aria-label="Dimensions">
          {[1, 2, 3, 4, 5].map((d) => (
            <li
              key={d}
              className={`label transition-colors duration-700 ${
                stage.dimension === d
                  ? "text-ochre"
                  : (stage.dimension ?? 0) > d
                    ? "text-chalk/60"
                    : "text-dust/40"
              }`}
            >
              {d}D
            </li>
          ))}
        </ol>
        <div key={stage.id} className="animate-ink-in">
          <h1 className="font-display text-chalk text-4xl sm:text-6xl">{stage.title}</h1>
          <p className="text-dust mt-1 font-sans text-sm">{stage.line}</p>
        </div>
      </header>

      <section className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-12 sm:px-10">
        {stage.id === "horizon" ? <HorizonMeter score={soundDensity(print)} /> : null}
        {stage.id === "superposition" ? (
          <Superposed candidates={candidates} active={cycle % candidates.length} />
        ) : null}
        {stage.id === "observed" ? (
          <div className="animate-ink-in pointer-events-auto max-w-2xl">
            <p className="label">{observed.form}</p>
            <h2 className="font-display text-chalk mt-2 text-4xl sm:text-6xl">
              {observed.title}
            </h2>
            <p className="text-chalk/80 mt-4 font-sans text-lg leading-relaxed sm:text-xl">
              {observed.interpretation}
            </p>
            <Measurements print={print} />
            <Link href="/" className="text-ochre mt-6 inline-block font-sans text-sm">
              Speak again
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function shapeFor(id: StageId, cycling: Shape, observed: Shape): Shape {
  switch (id) {
    case "voice":
      return "line";
    case "board":
      return "flat";
    case "gravity":
      return "terrain";
    case "horizon":
      return "well";
    case "superposition":
      return cycling;
    case "observed":
      return observed;
  }
}

/** Full-screen drawing of the recording, revealed left to right as if written. */
function SoundCanvas({
  print,
  mode,
  revealMs,
}: {
  print: SoundPrint;
  mode: "wave" | "spectrogram";
  revealMs: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const draw = () => {
      const ctx = el.getContext("2d");
      if (!ctx) return;
      const ratio = window.devicePixelRatio || 1;
      const w = el.clientWidth;
      const h = el.clientHeight;
      el.width = w * ratio;
      el.height = h * ratio;
      ctx.scale(ratio, ratio);
      if (mode === "wave") drawWave(ctx, print, w, h);
      else drawSpectrogram(ctx, print, w, h);
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(el);
    return () => observer.disconnect();
  }, [print, mode]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 ease-out"
      style={{
        clipPath: shown ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
        transition: `clip-path ${revealMs}ms linear`,
      }}
    >
      <canvas ref={canvas} className="h-full w-full" />
    </div>
  );
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  print: SoundPrint,
  w: number,
  h: number,
) {
  const n = print.waveform.length;
  const step = w / n;
  const mid = h / 2;
  print.waveform.forEach((v, i) => {
    const bar = Math.max(1, v * h * 0.36);
    ctx.fillStyle = `rgba(211, 163, 76, ${0.35 + v * 0.65})`;
    ctx.fillRect(i * step, mid - bar, Math.max(1, step - 1), bar * 2);
  });
}

function drawSpectrogram(
  ctx: CanvasRenderingContext2D,
  print: SoundPrint,
  w: number,
  h: number,
) {
  const cw = w / FRAMES;
  const ch = h / BANDS;
  print.spectrogram.forEach((row, f) => {
    row.forEach((v, b) => {
      const ink = v ** 1.6;
      if (ink < 0.02) return;
      ctx.fillStyle =
        ink > 0.6
          ? `rgba(241, 237, 225, ${ink})`
          : `rgba(211, 163, 76, ${Math.min(1, ink * 1.4)})`;
      ctx.fillRect(f * cw, h - (b + 1) * ch, cw + 0.5, ch + 0.5);
    });
  });
}

function HorizonMeter({ score }: { score: number }) {
  const [width, setWidth] = useState(0);
  const [crossed, setCrossed] = useState(false);
  const target = Math.max(score, EVENT_HORIZON + 0.05);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(target));
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return (
    <div className="flex max-w-xl items-center gap-4">
      <span className="label w-20 shrink-0">Density</span>
      <div className="bg-chalk/10 relative h-2 flex-1 rounded-full">
        <div
          className="from-dust to-ochre absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-[width] duration-[4000ms] ease-in"
          style={{ width: `${Math.round(width * 100)}%` }}
          onTransitionEnd={() => setCrossed(width >= EVENT_HORIZON)}
        />
        <div
          className="bg-chalk absolute -top-1.5 h-5 w-px"
          style={{ left: `${EVENT_HORIZON * 100}%` }}
        />
      </div>
      <span className="label w-28 text-right">
        {crossed ? "Past horizon" : "Falling"}
      </span>
    </div>
  );
}

function Superposed({
  candidates,
  active,
}: {
  candidates: SoundReading["candidates"];
  active: number;
}) {
  return (
    <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
      {candidates.map((candidate, i) => (
        <div
          key={candidate.form}
          className={`border-chalk/15 rounded-xl border bg-black/40 p-4 transition-opacity duration-500 ${
            i === active ? "opacity-100" : "opacity-40"
          }`}
        >
          <p className="label">{candidate.form}</p>
          <p className="font-display text-chalk mt-1 text-xl">{candidate.title}</p>
        </div>
      ))}
    </div>
  );
}

function Measurements({ print }: { print: SoundPrint }) {
  const facts = [
    ["Length", `${(print.durationMs / 1000).toFixed(1)} s`],
    ["Pitch", print.meanPitchHz ? `${Math.round(print.meanPitchHz)} Hz` : "none"],
    ["Centre", `${Math.round(print.centroidHz)} Hz`],
    ["Sound", `${Math.round(print.voicedRatio * 100)}%`],
  ];
  return (
    <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt className="label">{label}</dt>
          <dd className="text-chalk font-mono text-sm">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
