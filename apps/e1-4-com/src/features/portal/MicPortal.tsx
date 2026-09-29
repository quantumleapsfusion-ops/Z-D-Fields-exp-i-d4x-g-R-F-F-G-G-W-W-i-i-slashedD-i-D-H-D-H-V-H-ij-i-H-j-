"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useVoiceCapture } from "@/features/voice-stream/useVoiceCapture";

const THOUGHT_KEY = "e1-4:thought";
const MAX_LIVE_WORDS = 70;

/** The whole front door: one microphone, one line to type into. Everything else follows from it. */
export function MicPortal({ signedIn }: { signedIn: boolean }) {
  return signedIn ? <SignedInPortal /> : <GuestPortal />;
}

function GuestPortal() {
  const router = useRouter();
  const signIn = () => router.push("/login?next=/");
  return (
    <Frame corner={<CornerLink href="/stream" label="Sign in" />}>
      <Centre>
        <MicButton onClick={signIn} label="Sign in to speak" />
        <p className="label">Tap and speak</p>
      </Centre>
      <ThoughtBar
        onSubmit={(text) => {
          sessionStorage.setItem(THOUGHT_KEY, text);
          signIn();
        }}
      />
    </Frame>
  );
}

function SignedInPortal() {
  const capture = useVoiceCapture();
  const { recorder, live, carrying, silent, transcribing, carry } = capture;
  const recording = recorder.state !== "idle";
  const flowing = recording || carrying;

  useEffect(() => {
    const thought = sessionStorage.getItem(THOUGHT_KEY);
    if (!thought) return;
    sessionStorage.removeItem(THOUGHT_KEY);
    carry(thought);
  }, [carry]);

  const status = recorder.error
    ? recorder.error
    : recording
      ? "Tap when you are done"
      : transcribing
        ? "Turning your voice into words on this device"
        : carrying
          ? "Carrying it up"
          : silent
            ? "No words came through. Tap and try again."
            : "Tap and speak";

  return (
    <Frame corner={<CornerLink href="/stream" label="Your stream" />}>
      {flowing ? (
        <LiveWords text={[...live.phrases.map((p) => p.text), live.interim].join(" ")} />
      ) : null}
      <Centre docked={flowing}>
        <MicButton
          onClick={() => (recording ? capture.finish() : void capture.record())}
          label={recording ? "Stop" : "Speak"}
          small={flowing}
          level={recorder.state === "recording" ? recorder.level : 0}
          disabled={!recorder.supported || (carrying && !recording)}
        />
        <p role="status" className="label max-w-xs text-center">
          {status}
        </p>
      </Centre>
      {flowing ? null : <ThoughtBar onSubmit={carry} />}
    </Frame>
  );
}

function Frame({
  corner,
  children,
}: {
  corner: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-blackboard relative flex h-dvh flex-col items-center justify-center overflow-hidden px-6">
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

function Centre({ docked, children }: { docked?: boolean; children: React.ReactNode }) {
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
      className={`bg-ochre text-blackboard relative flex items-center justify-center rounded-full transition-all duration-700 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
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

function LiveWords({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean).slice(-MAX_LIVE_WORDS);
  return (
    <div
      aria-live="polite"
      className="absolute inset-0 flex flex-col justify-end overflow-hidden px-8 pt-16 pb-56 sm:px-16"
    >
      <p className="font-display text-chalk text-4xl leading-tight sm:text-6xl lg:text-7xl">
        {words.map((word, i) => (
          <span key={`${i}-${word}`} className="animate-ink-in inline-block pr-[0.28em]">
            {word}
          </span>
        ))}
      </p>
    </div>
  );
}

function ThoughtBar({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="z-10 mt-12 w-full max-w-xl"
      onSubmit={(event) => {
        event.preventDefault();
        const thought = text.trim();
        if (thought) onSubmit(thought);
      }}
    >
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Or type a thought"
        aria-label="Type a thought"
        enterKeyHint="go"
        className="border-chalk/20 bg-chalk/[0.04] text-chalk placeholder:text-dust focus:border-ochre w-full rounded-full border px-6 py-4 font-sans text-lg outline-none"
      />
    </form>
  );
}
