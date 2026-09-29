"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { MicMark } from "@/components/MicMark";
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
    <Frame phase="rest">
      <Centre>
        <MicButton
          onClick={() => router.push("/login?next=/")}
          label="Sign in to speak"
        />
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
      corner={<StreamLink />}
    >
      <Centre docked={docked}>
        <MicButton
          onClick={() => (recording ? capture.finish() : void capture.record())}
          label={recording ? "Stop" : "Speak"}
          small={docked}
          level={recorder.state === "recording" ? recorder.level : 0}
          disabled={!recorder.supported || (carrying && !recording)}
        />
        <p role="status" className="sr-only">
          {status}
        </p>
        {failedUploads ? (
          <button
            type="button"
            onClick={capture.retryFailed}
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
      className={`relative transition-all duration-700 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
        small ? "h-24 w-24" : "h-44 w-44 sm:h-56 sm:w-56"
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-[30%] bg-[#1f6bff]/30 blur-xl transition-transform duration-100"
        style={{ transform: `scale(${1 + Math.min(level, 1) * 0.9})` }}
      />
      <MicMark className="relative h-full w-full drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]" />
    </button>
  );
}
