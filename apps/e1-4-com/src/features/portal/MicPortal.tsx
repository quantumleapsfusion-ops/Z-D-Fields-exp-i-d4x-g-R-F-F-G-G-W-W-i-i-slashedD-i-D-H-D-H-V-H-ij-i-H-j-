"use client";

import { Logo } from "@earth-one/ui";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import type { PinPhase } from "@/features/codex/PinField";
import { speak } from "@/features/codex/voice";
import { useDaVinciTalk } from "@/features/davinci/useDaVinciTalk";
import { PasskeyAdd, PasskeyLogin } from "@/features/portal/Passkey";
import { decodeSound } from "@/features/sound/decode";
import { sendVoice, type VoiceRefusal } from "@/features/voice-id/pcm";
import { saveSpan } from "@/features/voice-stream/saveSpan";
import { usePendingFlush } from "@/features/voice-stream/usePendingFlush";
import { type CapturedSpan, useRecorder } from "@/features/voice-stream/useRecorder";
import { useVoiceCapture } from "@/features/voice-stream/useVoiceCapture";
import { useCarry } from "@/lib/carry";
import { haptic } from "@/lib/device/haptics";
import { requestTilt } from "@/lib/device/tilt";

const PinField = dynamic(() => import("@/features/codex/PinField"), { ssr: false });

const BUZZ_LEVEL = 0.35;
const BUZZ_GAP_MS = 220;

/** A short buzz on each loud moment of speech, so the phone answers the voice as the beads do. */
function useVoiceBuzz(level: number) {
  const last = useRef(0);
  useEffect(() => {
    if (level < BUZZ_LEVEL) return;
    const now = performance.now();
    if (now - last.current < BUZZ_GAP_MS) return;
    last.current = now;
    haptic("voice");
  }, [level]);
}

/** Da Vinci's front door: one microphone over a field of liquid metal. Everything follows from the sound. */
export function MicPortal({ signedIn }: { signedIn: boolean }) {
  return signedIn ? <Codex /> : <VoiceGate />;
}

/**
 * Says each digit aloud with the device's own voice and resolves when the last one is done. The
 * recording only starts afterwards, so the prompt can never be inside it.
 */
function sayDigits(digits: string, onWord: () => void): Promise<void> {
  return new Promise((resolve) => {
    speak(digits.split(""), { onLine: () => {}, onWord, onEnd: resolve });
  });
}

const MAX_ANSWER_MS = 8000;

/**
 * The voice is the only key. Tap, listen: the phone says four digits out loud. Say them back.
 * The sound itself (measured on the device, matched on the server) opens that speaker's stream,
 * or a new stream for a voice not heard before; the digits prove a live person is speaking, not
 * a recording. Nothing is ever written on screen: a refusal is a shake, a glyph and a vibration,
 * and after two misses a key appears to sign in with the phone's passkey instead. What was said
 * is kept whole as the first entry of that stream and, from the front door, carried on through
 * the dimensions.
 */
export function VoiceGate({ next = "/" }: { next?: string }) {
  const router = useRouter();
  const setSound = useCarry((state) => state.setSound);
  const [phase, setPhase] = useState<"idle" | "prompt" | "checking">("idle");
  const [refusal, setRefusal] = useState<VoiceRefusal | null>(null);
  const [misses, setMisses] = useState(0);
  const [pulse, setPulse] = useState(0);
  const challenge = useRef<string | null>(null);
  const answerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refuse = useCallback((reason: VoiceRefusal) => {
    haptic(reason === "voice" ? "rejected" : reason);
    setRefusal(reason);
    setMisses((n) => n + 1);
    setPhase("idle");
  }, []);

  const recorder = useRecorder(
    useCallback(
      async (span: CapturedSpan) => {
        if (answerTimer.current) clearTimeout(answerTimer.current);
        setPhase("checking");
        const result = await sendVoice(span, challenge.current);
        challenge.current = null;
        if (!result.ok) return refuse(result.reason);
        haptic("accepted");
        // Kept for later if the upload fails; never lost, never blocks the way in.
        await saveSpan(span);
        const print =
          next === "/" ? await decodeSound([span.blob]).catch(() => null) : null;
        if (print && print.voicedRatio > 0) {
          setSound(print);
          router.replace("/journey");
        } else {
          router.replace(next);
        }
        router.refresh();
      },
      [next, refuse, router, setSound],
    ),
  );
  const recording = recorder.state === "recording";
  useVoiceBuzz(recording ? recorder.level : 0);
  const { stop, arm, record } = recorder;

  useEffect(() => {
    if (!refusal) return;
    const timer = setTimeout(() => setRefusal(null), 1600);
    return () => clearTimeout(timer);
  }, [refusal]);

  useEffect(
    () => () => void (answerTimer.current && clearTimeout(answerTimer.current)),
    [],
  );

  const begin = async () => {
    // Everything that needs a tap happens here, before the first await.
    haptic("start");
    void requestTilt();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    }
    setRefusal(null);
    if (!(await arm())) return refuse("setup");

    const res = await fetch("/api/voice-id/challenge", { method: "POST" }).catch(
      () => null,
    );
    const body = res?.ok
      ? ((await res.json().catch(() => null)) as {
          challenge: { id: string; digits: string } | null;
        } | null)
      : null;
    if (!body) return refuse("setup");

    challenge.current = null;
    if (body.challenge) {
      if (!("speechSynthesis" in window)) return refuse("setup");
      challenge.current = body.challenge.id;
      setPhase("prompt");
      await sayDigits(body.challenge.digits, () => setPulse((n) => n + 1));
      await new Promise((done) => setTimeout(done, 350));
    }
    setPhase("idle");
    if (!(await record())) return;
    answerTimer.current = setTimeout(stop, MAX_ANSWER_MS);
  };

  return (
    <Frame
      phase={
        recording || phase === "checking"
          ? "listen"
          : phase === "prompt"
            ? "line"
            : "rest"
      }
      level={recorder.level}
      pulse={pulse}
    >
      <Centre>
        <div className={refusal ? "animate-voice-shake" : undefined}>
          <MicButton
            onClick={() => {
              if (recording) {
                haptic("stop");
                stop();
              } else {
                void begin();
              }
            }}
            label={recording ? "Stop" : "Speak to enter"}
            level={recording ? recorder.level : 0}
            disabled={!recorder.supported || phase !== "idle"}
          />
        </div>
        <div className="flex h-12 items-center gap-4">
          {refusal ? <RefusalGlyph reason={refusal} /> : null}
          {misses >= 2 || !recorder.supported ? <PasskeyLogin next={next} /> : null}
        </div>
        <p role="status" className="sr-only">
          {recorder.error ??
            (recording
              ? "Listening. Say the four digits you heard."
              : phase === "prompt"
                ? "Listen to four digits"
                : phase === "checking"
                  ? "Recognising your voice"
                  : refusal
                    ? "Not recognised. Tap and speak again."
                    : "Tap, listen, then say the digits back to enter")}
        </p>
      </Centre>
    </Frame>
  );
}

/** What went wrong, as a picture: a repeat arrow, an hourglass, or a broken link. */
function RefusalGlyph({ reason }: { reason: VoiceRefusal }) {
  const path =
    reason === "busy"
      ? "M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"
      : reason === "setup"
        ? "M9 15l-2 2a3 3 0 0 1-4-4l3-3M15 9l2-2a3 3 0 0 1 4 4l-3 3M9 9l6 6"
        : "M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5";
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="text-ochre h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

/**
 * Da Vinci over the pin field: tap the logo and speak, tap again and she answers out loud. Every
 * turn is also kept in your Voice Stream.
 */
function Codex() {
  const talk = useDaVinciTalk();
  const said = useRef<Promise<string>>(Promise.resolve(""));
  const capture = useVoiceCapture([], {
    onSettled: () => void said.current.then(talk.answer),
  });
  const { recorder, analysing, silent, failedUploads } = capture;
  const queued = usePendingFlush();
  const recording = recorder.state !== "idle";
  useVoiceBuzz(recorder.state === "recording" ? recorder.level : 0);
  const busy = talk.phase === "thinking" || talk.phase === "speaking";

  const start = async () => {
    talk.listen();
    await capture.record();
  };
  const stop = () => {
    said.current = talk.stopListening();
    capture.finish();
  };

  const status = recorder.error
    ? recorder.error
    : recording
      ? "Listening. Tap when you are done."
      : talk.phase === "speaking"
        ? talk.reply
        : talk.phase === "thinking" || analysing
          ? "Da Vinci is thinking"
          : failedUploads
            ? "Your entry did not save."
            : silent
              ? "No sound came through. Tap and try again."
              : "Tap and speak to Da Vinci";

  return (
    <Frame
      phase={recording ? "listen" : talk.phase === "speaking" ? "line" : "rest"}
      level={recorder.state === "recording" ? recorder.level : 0}
      pulse={talk.pulse}
      corner={
        <div className="flex items-center gap-2">
          <PasskeyAdd />
          <TalkLink />
          <StreamLink />
        </div>
      }
    >
      <Centre>
        <MicButton
          onClick={() => {
            if (recording) stop();
            else if (busy) talk.silence();
            else {
              void requestTilt();
              void start();
            }
          }}
          label={recording ? "Stop" : busy ? "Quiet" : "Speak to Da Vinci"}
          level={recorder.state === "recording" ? recorder.level : 0}
          speaking={talk.phase === "speaking" ? talk.pulse : undefined}
          disabled={!recorder.supported || talk.phase === "thinking"}
        />
        <p role="status" aria-live="polite" className="sr-only">
          {status}
        </p>
        {failedUploads || queued.waiting ? (
          <button
            type="button"
            onClick={() => {
              capture.retryFailed();
              void queued.retry();
            }}
            aria-label="Retry"
            className="text-ochre border-ochre/60 flex h-12 w-12 items-center justify-center rounded-full border"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
            >
              <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
            </svg>
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
  corner?: ReactNode;
  children: ReactNode;
  phase: PinPhase;
  level?: number;
  pulse?: number;
}) {
  return (
    <main className="bg-blackboard relative flex h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0">
        <PinField {...pins} logo />
      </div>
      <div className="absolute top-[max(1.25rem,env(safe-area-inset-top))] right-6 z-10">
        {corner}
      </div>
      {children}
    </main>
  );
}

function TalkLink() {
  return (
    <Link
      href="/talk"
      aria-label="Talk"
      className="text-dust hover:text-chalk flex h-10 w-10 items-center justify-center transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 5.5h16v10H10l-4 3.5v-3.5H4z" />
        <path d="M9 9.5v2M12 8v5M15 9.5v2" />
      </svg>
    </Link>
  );
}

function StreamLink() {
  return (
    <Link
      href="/stream"
      aria-label="Your stream"
      className="text-dust hover:text-chalk flex h-10 w-10 items-center justify-center transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      >
        <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2" />
      </svg>
    </Link>
  );
}

function Centre({ docked, children }: { docked?: boolean; children: ReactNode }) {
  return (
    <div
      className={`z-10 flex flex-col items-center gap-6 transition-all duration-700 ${
        docked ? "absolute bottom-[max(2.5rem,env(safe-area-inset-bottom))]" : ""
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
  speaking,
  disabled,
}: {
  onClick: () => void;
  label: string;
  small?: boolean;
  level?: number;
  /** Word count while Da Vinci speaks; each word makes the glow breathe. */
  speaking?: number;
  disabled?: boolean;
}) {
  const glow = speaking === undefined ? level : 0.35 + (speaking % 2) * 0.35;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`relative rounded-full transition-all duration-700 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
        small ? "h-24 w-24" : "h-64 w-48 sm:h-80 sm:w-60"
      }`}
    >
      {small ? (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[#1f6bff]/30 blur-xl transition-transform duration-100"
            style={{ transform: `scale(${1 + Math.min(glow, 1) * 0.9})` }}
          />
          <E14Mark />
        </>
      ) : null}
    </button>
  );
}

/** The e1-4 Ψπ mark, sized to its container. */
function E14Mark() {
  return (
    <Logo
      size={224}
      title="e1-4"
      className="relative !h-full !w-full drop-shadow-[0_0_40px_rgba(56,189,248,0.25)]"
    />
  );
}
