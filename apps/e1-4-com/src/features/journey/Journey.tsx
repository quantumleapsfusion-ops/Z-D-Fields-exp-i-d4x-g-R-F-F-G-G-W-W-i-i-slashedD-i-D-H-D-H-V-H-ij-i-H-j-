"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { MicMark } from "@/components/MicMark";
import { readLastEntry, rememberEntry } from "@/features/codex/entries";
import { pinsFor } from "@/features/codex/stages";
import { speak } from "@/features/codex/voice";
import { useCarry } from "@/lib/carry";
import { STAGES, nextStage, stageDuration } from "@/lib/journey";
import { narrate, summarise } from "@/lib/sound/commentary";
import { readSound } from "@/lib/sound/reading";

const PinField = dynamic(() => import("@/features/codex/PinField"), { ssr: false });

const CYCLE_MS = 1400;
/** If the device voice never reports that it finished, move on anyway after this long. */
const VOICE_GRACE_MS = 12000;

/**
 * Da Vinci: the stream's single path upward, shown only as one liquid-metal pin field and narrated
 * aloud. Each stage moves on once its time is up and its narration has been spoken; nothing waits
 * on a click.
 */
export function Journey() {
  const [print] = useState(() => useCarry.getState().sound);
  const [previous] = useState(readLastEntry);
  const reading = useMemo(() => (print ? readSound(print) : null), [print]);
  const [index, setIndex] = useState(0);
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
        setIndex((current) => (current === here ? nextStage(current) : current));
      }
    };
    const cancel = speak(narrate(stage.id, print, previous), {
      onLine: () => {},
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

  if (!print || !reading) {
    return (
      <main className="relative h-dvh overflow-hidden bg-black">
        <div className="absolute inset-0">
          <PinField phase="rest" />
        </div>
        <p className="sr-only">Your stream is silent.</p>
        <SpeakAgain />
      </main>
    );
  }

  const { candidates } = reading;
  const [phase, form] = pinsFor(
    stage.id,
    candidates[cycle % candidates.length].form,
    candidates[reading.resolvedIndex].form,
  );

  return (
    <main className="relative h-dvh overflow-hidden bg-black">
      <div className="absolute inset-0">
        <PinField phase={phase} print={print} form={form} pulse={pulse} />
      </div>
      {stage.id === "observed" ? <SpeakAgain /> : null}
    </main>
  );
}

function SpeakAgain() {
  return (
    <Link
      href="/"
      aria-label="Speak again"
      className="animate-ink-in absolute bottom-[max(2.5rem,env(safe-area-inset-bottom))] left-1/2 h-20 w-20 -translate-x-1/2"
    >
      <MicMark className="h-full w-full drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]" />
    </Link>
  );
}
