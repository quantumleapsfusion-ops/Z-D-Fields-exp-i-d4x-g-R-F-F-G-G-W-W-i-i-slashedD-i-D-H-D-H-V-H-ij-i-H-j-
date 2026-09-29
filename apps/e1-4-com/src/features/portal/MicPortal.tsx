"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import type { PinPhase } from "@/features/codex/PinField";
import { useVoiceCapture } from "@/features/voice-stream/useVoiceCapture";

const PinField = dynamic(() => import("@/features/codex/PinField"), { ssr: false });

/** Da Vinci's front door: one microphone over a field of liquid metal. Everything follows from the sound. */
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

/** Listens over the pin field; Stop keeps the original entry and carries it on through the dimensions. */
function Codex() {
  const capture = useVoiceCapture();
  const { recorder, analysing, carrying, silent, failedUploads } = capture;
  const recording = recorder.state !== "idle";
  const docked = recording || carrying;

  const status = recorder.error
    ? recorder.error
    : recording
      ? "Listening. Tap when you are done."
      : failedUploads
        ? "Your entry did not save."
        : analysing || carrying
          ? "Listening back"
          : silent
            ? "No sound came through. Tap and try again."
            : "Tap and speak";

  return (
    <Frame
      phase={recording ? "listen" : "rest"}
      level={recorder.state === "recording" ? recorder.level : 0}
      corner={<CornerLink href="/stream" label="Your stream" />}
    >
      <Centre docked={docked}>
        <MicButton
          onClick={() => (recording ? capture.finish() : void capture.record())}
          label={recording ? "Stop" : "Speak"}
          small={docked}
          level={recorder.state === "recording" ? recorder.level : 0}
          disabled={!recorder.supported || (carrying && !recording)}
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
}) {
  return (
    <main className="bg-blackboard relative flex h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0">
        <PinField {...pins} />
      </div>
      <p className="font-display text-chalk absolute top-5 left-6 z-10 text-lg tracking-[0.3em] uppercase">
        Da Vinci
      </p>
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
