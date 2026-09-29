"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Shape } from "@/features/gravity/TopologyCollapse";
import { useStreamTranscript } from "@/features/voice-stream/useStreamTranscript";
import { useCarry } from "@/lib/carry";
import {
  EVENT_HORIZON,
  density,
  stubSuperpose,
  type Superposition,
} from "@/lib/gravity/superposition";
import { STAGES, WORD_MS, nextStage, stageDuration, type StageId } from "@/lib/journey";

const TopologyCollapse = dynamic(() => import("@/features/gravity/TopologyCollapse"), {
  ssr: false,
});

const MAX_SPOKEN_WORDS = 95;
const MAX_BOARD_WORDS = 42;
const CYCLE_MS = 1400;

function spread(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * The stream's single path upward: sound, then words, then the board, the well, the horizon and
 * the box. Each stage runs on a timer and hands over to the next; nothing waits on a click.
 */
export function Journey() {
  const stream = useStreamTranscript();
  const [carried] = useState(() => useCarry.getState().text.trim());
  const text = (carried || stream.text).trim();
  const spoken = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const loading = !carried && stream.loading;
  const ready = !loading && spoken.length > 0;

  const [index, setIndex] = useState(0);
  const [superposition, setSuperposition] = useState<Superposition | null>(null);
  const [cycle, setCycle] = useState(0);
  const stage = STAGES[index];

  useEffect(() => {
    if (!ready) return;
    let active = true;
    fetch("/api/gravity/superpose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: text.slice(-12000) }),
    })
      .then((response) =>
        response.ok ? (response.json() as Promise<Superposition>) : Promise.reject(),
      )
      .catch(() => stubSuperpose(text))
      .then((result) => {
        if (active) setSuperposition(result);
      });
    return () => {
      active = false;
    };
  }, [ready, text]);

  useEffect(() => {
    if (!ready) return;
    const ms = stageDuration(stage.id, Math.min(spoken.length, MAX_SPOKEN_WORDS));
    if (ms === null) return;
    if (stage.id === "superposition" && !superposition) return;
    const timer = setTimeout(() => setIndex((current) => nextStage(current)), ms);
    return () => clearTimeout(timer);
  }, [ready, stage.id, spoken.length, superposition]);

  useEffect(() => {
    if (stage.id !== "superposition") return;
    const timer = setInterval(() => setCycle((current) => current + 1), CYCLE_MS);
    return () => clearInterval(timer);
  }, [stage.id]);

  const candidates = superposition?.candidates ?? [];
  const observed = superposition ? candidates[superposition.resolvedIndex] : undefined;
  const shape = shapeFor(
    stage.id,
    candidates.length ? candidates[cycle % candidates.length].form : undefined,
    observed?.form,
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="label animate-shimmer">Listening back</p>
      </main>
    );
  }

  if (!spoken.length) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-dust text-2xl">Your stream is silent.</p>
        <Link href="/" className="text-ochre font-sans text-sm">
          Speak
        </Link>
      </main>
    );
  }

  return (
    <main className="relative h-screen overflow-hidden bg-black">
      <div className="absolute inset-0">
        <TopologyCollapse
          form={shape}
          seed={text.slice(0, 200)}
          core={index >= STAGES.findIndex((s) => s.id === "gravity")}
        />
      </div>

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
        {stage.id === "voice" ? <Waveform /> : null}
        {stage.id === "horizon" ? <HorizonMeter score={density(text)} /> : null}
        {stage.id === "superposition" ? <Superposed candidates={candidates} /> : null}
        {stage.id === "observed" && observed ? (
          <div className="animate-ink-in pointer-events-auto max-w-2xl">
            <p className="label">{observed.form}</p>
            <h2 className="font-display text-chalk mt-2 text-4xl sm:text-6xl">
              {observed.title}
            </h2>
            <p className="text-chalk/80 mt-4 font-sans text-lg leading-relaxed sm:text-xl">
              {observed.interpretation}
            </p>
            <Link href="/" className="text-ochre mt-6 inline-block font-sans text-sm">
              Speak again
            </Link>
          </div>
        ) : null}
      </section>

      {stage.id === "text" ? <SpokenWords words={spoken} /> : null}

      {stage.id === "board" || stage.id === "gravity" ? (
        <BoardWords
          words={spoken.slice(0, MAX_BOARD_WORDS)}
          falling={stage.id === "gravity"}
        />
      ) : null}
    </main>
  );
}

function shapeFor(
  id: StageId,
  cycling: Shape | undefined,
  observed: Shape | undefined,
): Shape {
  switch (id) {
    case "voice":
    case "text":
      return "line";
    case "board":
      return "flat";
    case "gravity":
      return "well";
    case "horizon":
      return "sphere";
    case "superposition":
      return cycling ?? "sphere";
    case "observed":
      return observed ?? "sphere";
  }
}

function Waveform() {
  return (
    <div className="flex h-16 items-center justify-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: 40 }, (_, i) => (
        <span
          key={i}
          className="bg-ochre animate-wave h-full w-[3px] origin-center rounded-full"
          style={{
            animationDelay: `${(i % 10) * 90}ms`,
            opacity: 0.4 + spread(i, 1) * 0.6,
          }}
        />
      ))}
    </div>
  );
}

function SpokenWords({ words }: { words: string[] }) {
  const shown = words.slice(0, MAX_SPOKEN_WORDS);
  return (
    <p
      aria-live="polite"
      className="font-display text-chalk pointer-events-none absolute inset-x-0 top-1/2 max-h-[70vh] -translate-y-1/2 overflow-hidden px-8 text-4xl leading-tight sm:px-16 sm:text-6xl"
    >
      {shown.map((word, i) => (
        <span
          key={i}
          className="animate-ink-in inline-block pr-[0.28em]"
          style={{ animationDelay: `${i * WORD_MS}ms` }}
        >
          {word}
        </span>
      ))}
      {words.length > shown.length ? <span className="text-dust">…</span> : null}
    </p>
  );
}

function BoardWords({ words, falling }: { words: string[]; falling: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {words.map((word, i) => (
        <span
          key={i}
          className="font-display text-chalk/80 absolute text-2xl transition-all ease-in sm:text-4xl"
          style={{
            left: falling ? "50%" : `${8 + spread(i, 2) * 80}%`,
            top: falling ? "50%" : `${22 + spread(i, 3) * 56}%`,
            opacity: falling ? 0 : 1,
            transform: `translate(-50%, -50%) scale(${falling ? 0.1 : 1}) rotate(${falling ? 540 : (spread(i, 4) - 0.5) * 16}deg)`,
            transitionDuration: `${3500 + spread(i, 5) * 2500}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
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

function Superposed({ candidates }: { candidates: Superposition["candidates"] }) {
  return (
    <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
      {candidates.map((candidate, i) => (
        <div
          key={`${candidate.title}-${i}`}
          className="animate-shimmer border-chalk/15 rounded-xl border bg-black/40 p-4"
          style={{ animationDelay: `${i * 400}ms` }}
        >
          <p className="label">{candidate.form}</p>
          <p className="font-display text-chalk mt-1 text-lg">{candidate.title}</p>
        </div>
      ))}
    </div>
  );
}
