"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import { readLastEntry, rememberEntry } from "@/features/codex/entries";
import type { PinPhase } from "@/features/codex/PinField";
import { speak } from "@/features/codex/voice";
import { useVoiceCapture } from "@/features/voice-stream/useVoiceCapture";
import { useCarry } from "@/lib/carry";
import type { Form } from "@/lib/gravity/superposition";
import type { SoundPrint } from "@/lib/sound/analyse";
import { commentOn, summarise } from "@/lib/sound/commentary";
import { readSound } from "@/lib/sound/reading";

const PinField = dynamic(() => import("@/features/codex/PinField"), { ssr: false });

type Entry = { print: SoundPrint; lines: string[]; form: Form };

/** The whole front door: one microphone over a field of liquid metal. Everything follows from the sound. */
export function MicPortal({ signedIn }: { signedIn: boolean }) {
  return signedIn ? <Codex /> : <GuestPortal />;
}

function GuestPortal() {
  const router = useRouter();
  return (
    <Frame phase="rest" corner={<CornerLink href="/stream" label="Sign in" />}>
      <Centre>
        <MicButton
          onClick={() => router.push("/login?next=/")}
          label="Sign in to speak"
        />
        <p className="label">Tap and speak</p>
      </Centre>
    </Frame>
  );
}

/**
 * Listens, keeps the original entry in the stream, then talks back about what it heard while the
 * pins rise into the sound and its shape, and carries the entry on through the dimensions.
 */
function Codex() {
  const router = useRouter();
  const setSound = useCarry((state) => state.setSound);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [line, setLine] = useState(-1);
  const [pulse, setPulse] = useState(0);

  const onSound = useCallback((print: SoundPrint) => {
    const reading = readSound(print);
    const lines = commentOn(print, readLastEntry());
    rememberEntry(summarise(print));
    setEntry({ print, lines, form: reading.candidates[reading.resolvedIndex].form });
  }, []);
  const capture = useVoiceCapture([], onSound);
  const { recorder, analysing, silent, failedUploads } = capture;
  const recording = recorder.state !== "idle";

  useEffect(() => {
    if (!entry) return;
    return speak(entry.lines, {
      onLine: setLine,
      onWord: () => setPulse((p) => p + 1),
      onEnd: () => {
        setSound(entry.print);
        router.push("/journey");
      },
    });
  }, [entry, router, setSound]);

  const phase: PinPhase = recording
    ? "listen"
    : entry
      ? line < 1
        ? "relief"
        : "form"
      : "rest";

  const status = recorder.error
    ? recorder.error
    : recording
      ? "Listening. Tap when you are done."
      : failedUploads
        ? "Your entry did not save."
        : analysing
          ? "Listening back"
          : entry
            ? "Tap to speak again"
            : silent
              ? "No sound came through. Tap and try again."
              : "Tap and speak";

  const start = () => {
    setEntry(null);
    setLine(-1);
    void capture.record();
  };

  return (
    <Frame
      phase={phase}
      level={recorder.state === "recording" ? recorder.level : 0}
      print={entry?.print}
      form={entry?.form}
      pulse={pulse}
      corner={<CornerLink href="/stream" label="Your stream" />}
    >
      {entry && line >= 0 ? (
        <p
          key={line}
          aria-live="polite"
          className="animate-ink-in font-display text-chalk absolute inset-x-0 top-16 z-10 px-8 text-center text-3xl leading-snug [text-shadow:0_2px_24px_#000] sm:px-20 sm:text-5xl"
        >
          {entry.lines[line]}
        </p>
      ) : null}
      <Centre docked={recording || Boolean(entry) || analysing}>
        <MicButton
          onClick={() => (recording ? capture.finish() : start())}
          label={recording ? "Stop" : "Speak"}
          small={recording || Boolean(entry) || analysing}
          level={recorder.state === "recording" ? recorder.level : 0}
          disabled={!recorder.supported || analysing}
        />
        <p role="status" className="label max-w-xs text-center">
          {status}
        </p>
        {failedUploads ? (
          <button
            type="button"
            onClick={capture.retryFailed}
            className="text-ochre text-sm"
          >
            Retry
          </button>
        ) : null}
      </Centre>
    </Frame>
  );
}

function Frame({
  corner,
  children,
  ...pins
}: {
  corner: ReactNode;
  children: ReactNode;
  phase: PinPhase;
  level?: number;
  print?: SoundPrint | null;
  form?: Form;
  pulse?: number;
}) {
  return (
    <main className="bg-blackboard relative flex h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0">
        <PinField {...pins} />
      </div>
      <div className="absolute top-5 right-6 z-10">{corner}</div>
      {children}
    </main>
  );
}

function CornerLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="label hover:text-chalk transition-colors">
      {label}
    </Link>
  );
}

function Centre({ docked, children }: { docked?: boolean; children: ReactNode }) {
  return (
    <div
      className={`z-10 flex flex-col items-center gap-6 transition-all duration-700 ${
        docked ? "absolute bottom-10" : ""
      }`}
    >
      {children}
    </div>
  );
}

function MicButton({
  onClick,
  label,
  small,
  level = 0,
  disabled,
}: {
  onClick: () => void;
  label: string;
  small?: boolean;
  level?: number;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`bg-ochre text-blackboard relative flex items-center justify-center rounded-full shadow-[0_0_60px_rgba(0,0,0,0.8)] transition-all duration-700 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
        small ? "h-24 w-24" : "h-44 w-44 sm:h-56 sm:w-56"
      }`}
    >
      <span
        aria-hidden="true"
        className="bg-ochre/25 absolute inset-0 rounded-full transition-transform duration-100"
        style={{ transform: `scale(${1 + Math.min(level, 1) * 0.9})` }}
      />
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`relative ${small ? "h-9 w-9" : "h-16 w-16 sm:h-20 sm:w-20"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      >
        <rect
          x="9"
          y="3"
          width="6"
          height="11"
          rx="3"
          fill="currentColor"
          stroke="none"
        />
        <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
      </svg>
    </button>
  );
}
