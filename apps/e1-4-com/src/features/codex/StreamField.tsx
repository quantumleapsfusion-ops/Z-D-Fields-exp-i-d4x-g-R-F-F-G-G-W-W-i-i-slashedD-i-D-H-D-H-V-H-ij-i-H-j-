"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { MicMark } from "@/components/MicMark";
import { decodeSound } from "@/features/sound/decode";
import { levelAt, onsets } from "@/features/sound/playback";
import { useVoiceCapture } from "@/features/voice-stream/useVoiceCapture";
import { haptic } from "@/lib/device/haptics";
import { requestTilt } from "@/lib/device/tilt";
import { useVoiceBuzz } from "@/lib/device/useVoiceBuzz";
import type { Form } from "@/lib/gravity/superposition";
import type { SoundPrint } from "@/lib/sound/analyse";
import { commentOn } from "@/lib/sound/commentary";
import { readSound } from "@/lib/sound/reading";

import type { PinPhase } from "./PinField";
import { speak } from "./voice";

const PinField = dynamic(() => import("./PinField"), { ssr: false });

export type StreamEntry = { id: string; durationMs: number; audioUrl: string };

type Heard = { url: string; print: SoundPrint | null };

/**
 * The stream you come back to: every original entry is a bead along the bottom. Touching one
 * plays it as it was recorded while the metal moves to it, then folds it into its shape and
 * speaks. The play mark runs the whole stream end to end, one entry into the next. On your own
 * stream the microphone keeps adding to it, so it is one continuous stream however often you
 * return. The motion is measured from the saved recording itself, so it plays back the same
 * every time.
 */
export function StreamField({
  entries: saved,
  ownStream = false,
}: {
  entries: StreamEntry[];
  /** The signed-in person's own stream: speaking here appends to it. */
  ownStream?: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [continuous, setContinuous] = useState(false);
  const [phase, setPhase] = useState<PinPhase>("rest");
  const [print, setPrint] = useState<SoundPrint | null>(null);
  const [form, setForm] = useState<Form | undefined>(undefined);
  const [pulse, setPulse] = useState(0);
  const stop = useRef<() => void>(() => {});
  const heard = useRef(new Map<string, Promise<Heard>>());
  const audio = useRef<HTMLAudioElement | null>(null);
  const playing = useRef<{ print: SoundPrint; audio: HTMLAudioElement } | null>(null);

  const capture = useVoiceCapture([], { onSettled: () => setPhase("rest") });
  const { recorder } = capture;
  const recording = recorder.state !== "idle";
  useVoiceBuzz(recorder.state === "recording" ? recorder.level : 0);

  const entries: StreamEntry[] = [
    ...saved,
    ...capture.segments
      .filter((s) => !saved.some((e) => e.id === s.id))
      .map((s) => ({
        id: s.id,
        durationMs: s.durationMs,
        audioUrl: `/api/stream/segments/${s.id}/audio`,
      })),
  ];

  useEffect(
    () => () => {
      stop.current();
      for (const item of heard.current.values())
        void item.then(({ url }) => URL.revokeObjectURL(url));
    },
    [],
  );

  /** Fetches and measures an entry once; replays reuse it. */
  const load = (entry: StreamEntry): Promise<Heard> => {
    let item = heard.current.get(entry.id);
    if (!item) {
      item = fetch(entry.audioUrl).then(async (res) => {
        if (!res.ok) throw new Error(`audio ${res.status}`);
        const blob = await res.blob();
        return { url: URL.createObjectURL(blob), print: await decodeSound([blob]) };
      });
      item.catch(() => heard.current.delete(entry.id));
      heard.current.set(entry.id, item);
    }
    return item;
  };

  const progress = useCallback(() => {
    const now = playing.current;
    if (!now) return 0;
    return (now.audio.currentTime * 1000) / Math.max(1, now.print.durationMs);
  }, []);
  const playbackLevel = useCallback(() => {
    const now = playing.current;
    return now ? levelAt(now.print, progress()) : 0;
  }, [progress]);

  const play = async (index: number, runOn: boolean) => {
    const entry = entries[index];
    if (!entry) return;
    stop.current();
    setActive(entry.id);
    setContinuous(runOn);
    setPhase("listen");
    let cancelled = false;
    let cancelVoice = () => {};
    let frame = 0;
    const player = (audio.current ??= new Audio());
    stop.current = () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      player.onended = null;
      player.pause();
      playing.current = null;
      cancelVoice();
    };
    try {
      const { url, print: measured } = await load(entry);
      if (cancelled) return;
      setPrint(measured);
      if (measured) {
        const reading = readSound(measured);
        setForm(reading.candidates[reading.resolvedIndex].form);
        playing.current = { print: measured, audio: player };
        setPhase("play");
        const beat = onsets();
        const tick = () => {
          if (beat(playbackLevel(), performance.now())) {
            setPulse((p) => p + 1);
            haptic("voice");
          }
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      }
      player.src = url;
      player.onended = () => {
        cancelAnimationFrame(frame);
        playing.current = null;
        if (cancelled) return;
        if (runOn && index + 1 < entries.length) return void play(index + 1, true);
        setContinuous(false);
        if (!measured) return setPhase("rest");
        setPhase("form");
        cancelVoice = speak(commentOn(measured), {
          onLine: () => {},
          onWord: () => setPulse((p) => p + 1),
          onEnd: () => {},
        });
      };
      await player.play().catch(() => player.onended?.(new Event("ended")));
    } catch {
      playing.current = null;
      setPhase("rest");
    }
  };

  const halt = () => {
    stop.current();
    setActive(null);
    setContinuous(false);
    setPhase("rest");
  };

  const speakInto = async () => {
    if (recording) {
      capture.finish();
      return;
    }
    halt();
    void requestTilt();
    await capture.record();
  };

  const longest = Math.max(1, ...entries.map((e) => e.durationMs));
  const status = recorder.error
    ? recorder.error
    : recording
      ? "Listening. Tap when you are done."
      : capture.failedUploads
        ? "Your entry did not save."
        : capture.pending.length > 0
          ? "Saving"
          : continuous
            ? "Playing your stream"
            : entries.length === 0
              ? "Your stream is silent."
              : "";

  return (
    <main className="relative h-dvh overflow-hidden bg-black">
      <div className="absolute inset-0">
        <PinField
          phase={recording ? "listen" : phase}
          level={recorder.state === "recording" ? recorder.level : 0}
          levelSource={phase === "play" && !recording ? playbackLevel : undefined}
          progress={progress}
          print={print}
          form={form}
          pulse={pulse}
        />
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
      {ownStream ? (
        <button
          type="button"
          onClick={() => void speakInto()}
          aria-label={recording ? "Stop" : "Speak into your stream"}
          aria-pressed={recording}
          disabled={!recorder.supported}
          className={`absolute top-[max(1.25rem,env(safe-area-inset-top))] right-6 z-10 h-12 w-12 rounded-[14px] transition disabled:opacity-50 ${
            recording ? "ring-2 ring-[#1f6bff] ring-offset-2 ring-offset-black" : ""
          }`}
          style={
            recording ? { transform: `scale(${1 + recorder.level * 0.25})` } : undefined
          }
        >
          <MicMark className="h-full w-full" />
        </button>
      ) : (
        <Link
          href="/"
          aria-label="Speak"
          className="absolute top-[max(1.25rem,env(safe-area-inset-top))] right-6 z-10 h-12 w-12"
        >
          <MicMark className="h-full w-full" />
        </Link>
      )}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 px-6 pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        {entries.length > 1 ? (
          <button
            type="button"
            onClick={() => (continuous ? halt() : void play(0, true))}
            aria-label={continuous ? "Stop your stream" : "Play your whole stream"}
            aria-pressed={continuous}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 text-white/80 transition hover:border-white hover:text-white"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              {continuous ? (
                <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" />
              ) : (
                <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
              )}
            </svg>
          </button>
        ) : null}
        <ol aria-label="Your stream" className="flex items-center gap-3 overflow-x-auto">
          {entries.map((entry, i) => {
            const size = 28 + Math.round(36 * Math.sqrt(entry.durationMs / longest));
            return (
              <li key={entry.id} className="shrink-0">
                <button
                  type="button"
                  aria-label={`Entry ${i + 1}`}
                  aria-pressed={active === entry.id}
                  onClick={() => void play(i, false)}
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
          {capture.pending.map((p) => (
            <li key={p.id} className="shrink-0" aria-hidden="true">
              <span
                className={`block h-7 w-7 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f4f6f8,#8a929c_45%,#2b2f35)] opacity-50 motion-safe:animate-pulse ${
                  p.failed ? "ring-ochre ring-2" : ""
                }`}
              />
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
