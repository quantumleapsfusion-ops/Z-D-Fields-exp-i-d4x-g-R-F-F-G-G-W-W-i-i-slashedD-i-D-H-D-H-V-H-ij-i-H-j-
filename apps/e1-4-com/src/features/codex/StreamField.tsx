"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { MicMark } from "@/components/MicMark";
import { decodeSound } from "@/features/sound/decode";
import type { Form } from "@/lib/gravity/superposition";
import type { SoundPrint } from "@/lib/sound/analyse";
import { commentOn } from "@/lib/sound/commentary";
import { readSound } from "@/lib/sound/reading";
import { haptic } from "@/lib/device/haptics";

import type { PinPhase } from "./PinField";
import { speak } from "./voice";

const PinField = dynamic(() => import("./PinField"), { ssr: false });

export type StreamEntry = { id: string; durationMs: number; audioUrl: string };

/**
 * The stream you come back to: every original entry is a bead along the bottom. Touching one
 * plays it as it was recorded, raises it in the metal, then folds it into its shape and speaks.
 */
export function StreamField({ entries }: { entries: StreamEntry[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [phase, setPhase] = useState<PinPhase>("rest");
  const [print, setPrint] = useState<SoundPrint | null>(null);
  const [form, setForm] = useState<Form | undefined>(undefined);
  const [pulse, setPulse] = useState(0);
  const stop = useRef<() => void>(() => {});

  useEffect(() => () => stop.current(), []);

  const open = async (entry: StreamEntry) => {
    stop.current();
    haptic("stage");
    setActive(entry.id);
    setPhase("listen");
    let cancelled = false;
    let cancelVoice = () => {};
    const audio = new Audio();
    stop.current = () => {
      cancelled = true;
      audio.pause();
      cancelVoice();
    };
    try {
      const res = await fetch(entry.audioUrl);
      if (!res.ok || cancelled) return;
      const blob = await res.blob();
      const measured = await decodeSound([blob]);
      if (cancelled) return;
      setPrint(measured);
      if (measured) {
        const reading = readSound(measured);
        setForm(reading.candidates[reading.resolvedIndex].form);
      }
      setPhase(measured ? "relief" : "listen");
      const url = URL.createObjectURL(blob);
      audio.src = url;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (cancelled || !measured) return setPhase("rest");
        setPhase("form");
        cancelVoice = speak(commentOn(measured), {
          onLine: () => {},
          onWord: () => setPulse((p) => p + 1),
          onEnd: () => {
            haptic("saved");
          },
        });
      };
      await audio.play().catch(() => audio.onended?.(new Event("ended")));
    } catch {
      setPhase("rest");
    }
  };

  const longest = Math.max(1, ...entries.map((e) => e.durationMs));

  return (
    <main className="relative h-dvh overflow-hidden bg-black">
      <div className="absolute inset-0">
        <PinField phase={phase} print={print} form={form} pulse={pulse} />
      </div>
      <Link
        href="/"
        aria-label="Speak"
        className="absolute top-[max(1.25rem,env(safe-area-inset-top))] right-6 z-10 h-12 w-12"
      >
        <MicMark className="h-full w-full" />
      </Link>
      {entries.length === 0 ? <p className="sr-only">Your stream is silent.</p> : null}
      <ol
        aria-label="Your stream"
        className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 overflow-x-auto px-6 pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]"
      >
        {entries.map((entry, i) => {
          const size = 28 + Math.round(36 * Math.sqrt(entry.durationMs / longest));
          return (
            <li key={entry.id} className="shrink-0">
              <button
                type="button"
                aria-label={`Entry ${i + 1}`}
                aria-pressed={active === entry.id}
                onClick={() => void open(entry)}
                style={{ width: size, height: size }}
                className={`rounded-full bg-[radial-gradient(circle_at_30%_30%,#f4f6f8,#8a929c_45%,#2b2f35)] shadow-[0_0_24px_rgba(0,0,0,0.9)] transition ${
                  active === entry.id
                    ? "ring-2 ring-[#1f6bff] ring-offset-2 ring-offset-black"
                    : "opacity-80 hover:opacity-100"
                }`}
              />
            </li>
          );
        })}
      </ol>
    </main>
  );
}
