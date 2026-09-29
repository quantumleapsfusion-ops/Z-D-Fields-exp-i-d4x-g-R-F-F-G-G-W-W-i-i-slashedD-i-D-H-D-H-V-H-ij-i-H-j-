"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { concatPcm, int16ToBytes } from "@/lib/voice-id/pcm";

import { useVoiceCapture } from "./useVoiceCapture";

/** Lines read aloud to build a voiceprint: varied sounds, about 15 seconds in total. */
export const ENROLL_LINES = [
  "Greetings Earthling. This is my voice, and it is the only key I need.",
  "One continuous recording per person, pausable and resumable on a whim.",
  "Physics, mechanics, anything too spatial for a sentence — I can say it out loud.",
];

const SIGN_IN_SECONDS = 6;
const MIN_ENROLL_SECONDS = 8;

const MESSAGES: Record<string, string> = {
  voice_id_unavailable: "Voice sign-in is switched off on this server.",
  bad_audio: "That recording was too short or too quiet. Try again.",
  challenge_expired: "That phrase expired. Here's a new one.",
  phrase_mismatch: "I didn't hear the phrase. Say the four words shown.",
  voice_not_recognised:
    "I don't recognise this voice. New here? Teach me your voice instead.",
  need_more_speech: "Almost there — read the lines once more.",
  voice_already_known: "This voice already has an account. Sign in instead.",
};

type Mode = "sign-in" | "enroll";
type Phase = "idle" | "listening" | "checking" | "done";
type Challenge = { id: string; phrase: string };

async function post(url: string, pcm: Int16Array) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/octet-stream" },
    body: new Blob([new Uint8Array(int16ToBytes(pcm))]),
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    percentage?: number;
  };
  return { ok: res.ok, ...body };
}

/**
 * Voice-only identity: say a one-time phrase to sign in, or read three lines to create a
 * voiceprint. No email, no password. `signedIn` switches it to (re)enrolling the current account.
 */
export function VoiceGate({
  available,
  next = "/stream",
  signedIn = false,
  initialMode = "sign-in",
}: {
  available: boolean;
  next?: string;
  signedIn?: boolean;
  initialMode?: Mode;
}) {
  const router = useRouter();
  const capture = useVoiceCapture();
  const [mode, setMode] = useState<Mode>(signedIn ? "enroll" : initialMode);
  const [phase, setPhase] = useState<Phase>("idle");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const earlier = useRef<Int16Array[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const succeed = useCallback(() => {
    setPhase("done");
    setMessage(signedIn ? "Your voice is saved." : "Welcome back, Earthling.");
    if (signedIn) router.refresh();
    else {
      router.replace(next);
      router.refresh();
    }
  }, [next, router, signedIn]);

  const finish = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const pcm = await capture.stop();
    setPhase("checking");
    try {
      if (mode === "sign-in") {
        const result = await post(
          `/api/voice-id/verify?challenge=${challenge?.id ?? ""}`,
          pcm,
        );
        if (result.ok) return succeed();
        setChallenge(null);
        setMessage(MESSAGES[result.error ?? ""] ?? "Something went wrong. Try again.");
      } else {
        const all = concatPcm([...earlier.current, pcm]);
        const result = await post("/api/voice-id/enroll", all);
        if (result.ok) {
          earlier.current = [];
          return succeed();
        }
        if (result.error === "need_more_speech") {
          earlier.current = [all];
          setProgress(result.percentage ?? null);
        } else earlier.current = [];
        setMessage(MESSAGES[result.error ?? ""] ?? "Something went wrong. Try again.");
      }
    } catch {
      setMessage("Couldn't reach the server. Try again.");
    }
    setPhase("idle");
  }, [capture, challenge, mode, succeed]);

  const begin = useCallback(async () => {
    setMessage(null);
    try {
      if (mode === "sign-in") {
        const res = await fetch("/api/voice-id/challenge", { method: "POST" });
        const body = (await res.json()) as Challenge & { error?: string };
        if (!res.ok) {
          setMessage(MESSAGES[body.error ?? ""] ?? "Voice sign-in is unavailable.");
          return;
        }
        setChallenge(body);
      }
      await capture.start();
      setPhase("listening");
      if (mode === "sign-in")
        timer.current = setTimeout(() => void finish(), SIGN_IN_SECONDS * 1000);
    } catch {
      setMessage("I need the microphone to hear you. Allow it and try again.");
      setPhase("idle");
    }
  }, [capture, finish, mode]);

  const switchMode = (to: Mode) => {
    if (phase === "listening" || phase === "checking") return;
    earlier.current = [];
    setProgress(null);
    setChallenge(null);
    setMessage(null);
    setMode(to);
  };

  if (!available) {
    return (
      <p className="border-line text-dust rounded-(--radius-board) border px-4 py-3 text-sm">
        Voice sign-in is switched off on this server.
      </p>
    );
  }

  const listening = phase === "listening";
  const canFinish =
    listening && (mode === "sign-in" || capture.seconds >= MIN_ENROLL_SECONDS);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div aria-live="polite" className="min-h-24">
        {mode === "sign-in" ? (
          challenge && phase !== "done" ? (
            <>
              <p className="label mb-2">Say</p>
              <p className="font-display text-chalk text-3xl tracking-tight">
                {challenge.phrase}
              </p>
            </>
          ) : (
            <p className="text-dust font-sans">
              Your voice is your key. Tap the orb and say the words that appear.
            </p>
          )
        ) : (
          <ol className="text-chalk/90 space-y-2 text-left font-sans">
            {ENROLL_LINES.map((line) => (
              <li key={line}>“{line}”</li>
            ))}
          </ol>
        )}
      </div>

      <button
        type="button"
        onClick={() => void (listening ? (canFinish ? finish() : undefined) : begin())}
        disabled={phase === "checking" || phase === "done" || (listening && !canFinish)}
        aria-label={
          listening
            ? "Done speaking"
            : mode === "sign-in"
              ? "Speak to sign in"
              : signedIn
                ? "Record my voice"
                : "Teach e1-4 my voice"
        }
        className="border-ochre/70 text-ochre relative flex h-28 w-28 items-center justify-center rounded-full border transition disabled:opacity-60"
        style={{
          boxShadow: `0 0 ${12 + capture.level * 60}px rgba(211,163,76,${0.2 + capture.level * 0.6})`,
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <rect x="9" y="3" width="6" height="12" rx="3" strokeWidth="1.6" />
          <path
            d="M5 11a7 7 0 0 0 14 0M12 18v3"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <p className="label min-h-5" aria-live="polite">
        {phase === "checking"
          ? "Listening back…"
          : listening
            ? mode === "enroll"
              ? capture.seconds < MIN_ENROLL_SECONDS
                ? `Keep reading… ${Math.floor(capture.seconds)}s`
                : "Tap when you've read all three"
              : "Listening…"
            : progress !== null
              ? `Voiceprint ${Math.round(progress)}%`
              : ""}
      </p>

      {message ? (
        <p
          role="status"
          className="border-ochre text-ochre rounded-(--radius-board) border px-4 py-3 text-sm"
        >
          {message}
        </p>
      ) : null}

      {signedIn ? null : (
        <button
          type="button"
          onClick={() => switchMode(mode === "sign-in" ? "enroll" : "sign-in")}
          className="text-dust hover:text-chalk font-sans text-sm transition-colors"
        >
          {mode === "sign-in"
            ? "New here? Teach e1-4 your voice"
            : "Already known? Speak to sign in"}
        </button>
      )}
    </div>
  );
}
