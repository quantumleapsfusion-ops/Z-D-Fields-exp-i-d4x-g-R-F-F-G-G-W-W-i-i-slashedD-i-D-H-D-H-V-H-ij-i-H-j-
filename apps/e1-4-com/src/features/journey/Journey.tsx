"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { readLastEntry, rememberEntry } from "@/features/codex/entries";
import type { PinPhase } from "@/features/codex/PinField";
import { speak } from "@/features/codex/voice";
import { useCarry } from "@/lib/carry";
import type { Form } from "@/lib/gravity/superposition";
import { STAGES, type StageId, nextStage, stageDuration } from "@/lib/journey";
import type { SoundPrint } from "@/lib/sound/analyse";
import { narrate, summarise } from "@/lib/sound/commentary";
import { readSound } from "@/lib/sound/reading";

const PinField = dynamic(() => import("@/features/codex/PinField"), { ssr: false });

const CYCLE_MS = 1400;
/** If the device voice never reports that it finished, move on anyway after this long. */
const VOICE_GRACE_MS = 12000;

/**
 * Da Vinci: the stream's single path upward, shown on one liquid-metal pin field and narrated
 * aloud. Each stage moves on once its time is up and its narration has been spoken; nothing waits
 * on a click.
 */
export function Journey() {
  const [print] = useState(() => useCarry.getState().sound);
  const [previous] = useState(readLastEntry);
  const reading = useMemo(() => (print ? readSound(print) : null), [print]);
  const [index, setIndex] = useState(0);
  const [line, setLine] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [cycle, setCycle] = useState(0);
  const stage = STAGES[index];
  const done = useRef({ timer: -1, voice: -1 });

  useEffect(() => {
    if (print) rememberEntry(summarise(print));
  }, [print]);

  useEffect(() => {
    if (!print) return;
    const here = index;
    const advance = (part: "timer" | "voice") => {
      done.current[part] = here;
      if (done.current.timer === here && done.current.voice === here) {
        setLine(0);
        setIndex((current) => (current === here ? nextStage(current) : current));
      }
    };
    const cancel = speak(narrate(stage.id, print, previous), {
      onLine: setLine,
      onWord: () => setPulse((p) => p + 1),
      onEnd: () => advance("voice"),
    });
    const ms = stageDuration(stage.id);
    const timers =
      ms === null
        ? []
        : [
            setTimeout(() => advance("timer"), ms),
            setTimeout(() => {
              advance("timer");
              advance("voice");
            }, ms + VOICE_GRACE_MS),
          ];
    return () => {
      cancel();
      timers.forEach(clearTimeout);
    };
  }, [print, previous, index, stage.id]);

  useEffect(() => {
    if (stage.id !== "superposition") return;
    const timer = setInterval(() => setCycle((current) => current + 1), CYCLE_MS);
    return () => clearInterval(timer);
  }, [stage.id]);

  const lines = useMemo(
    () => (print ? narrate(stage.id, print, previous) : []),
    [print, previous, stage.id],
  );

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
  const cycling = candidates[cycle % candidates.length];
  const [phase, form] = pinsFor(stage.id, cycling.form, observed.form);

  return (
    <main className="relative h-dvh overflow-hidden bg-black">
      <div className="absolute inset-0">
        <PinField phase={phase} print={print} form={form} pulse={pulse} />
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-3 px-6 pt-8 sm:px-10">
        <div className="flex items-center gap-6">
          <p className="font-display text-chalk text-lg tracking-[0.3em] uppercase">
            Da Vinci
          </p>
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
        </div>
        <h1
          key={stage.id}
          className="animate-ink-in font-display text-chalk text-4xl [text-shadow:0_2px_24px_#000] sm:text-6xl"
        >
          {stage.id === "superposition"
            ? cycling.title
            : stage.id === "observed"
              ? observed.title
              : stage.title}
        </h1>
      </header>

      <section className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-10 sm:px-10">
        <p
          key={`${stage.id}-${line}`}
          aria-live="polite"
          className="animate-ink-in font-display text-chalk max-w-4xl text-2xl leading-snug [text-shadow:0_2px_24px_#000] sm:text-4xl"
        >
          {lines[line] ?? lines[0]}
        </p>
        {stage.id === "observed" ? (
          <div className="animate-ink-in pointer-events-auto mt-6">
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

function pinsFor(id: StageId, cycling: Form, observed: Form): [PinPhase, Form] {
  switch (id) {
    case "voice":
      return ["line", observed];
    case "board":
      return ["board", observed];
    case "gravity":
      return ["relief", observed];
    case "horizon":
      return ["well", observed];
    case "superposition":
      return ["form", cycling];
    case "observed":
      return ["form", observed];
  }
}

function Measurements({ print }: { print: SoundPrint }) {
  const facts = [
    ["Length", `${(print.durationMs / 1000).toFixed(1)} s`],
    ["Pitch", print.meanPitchHz ? `${Math.round(print.meanPitchHz)} Hz` : "none"],
    ["Centre", `${Math.round(print.centroidHz)} Hz`],
    ["Sound", `${Math.round(print.voicedRatio * 100)}%`],
  ];
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-2">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt className="label">{label}</dt>
          <dd className="text-chalk font-mono text-sm">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
