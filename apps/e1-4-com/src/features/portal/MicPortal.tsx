"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";

import { useVoiceCapture } from "@/features/voice-stream/useVoiceCapture";

const ROW_PX = 96;
const STEP_PX = 2;

/** The whole front door: one microphone. Everything else follows from the sound. */
export function MicPortal({ signedIn }: { signedIn: boolean }) {
  return signedIn ? <SignedInPortal /> : <GuestPortal />;
}

function GuestPortal() {
  const router = useRouter();
  return (
    <Frame corner={<CornerLink href="/stream" label="Sign in" />}>
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

function SignedInPortal() {
  const capture = useVoiceCapture();
  const { recorder, carrying, analysing, silent } = capture;
  const recording = recorder.state !== "idle";
  const flowing = recording || carrying;

  const status = recorder.error
    ? recorder.error
    : recording
      ? "Tap when you are done"
      : analysing
        ? "Listening back"
        : carrying
          ? "Carrying it up"
          : silent
            ? "No sound came through. Tap and try again."
            : "Tap and speak";

  return (
    <Frame corner={<CornerLink href="/stream" label="Your stream" />}>
      {flowing ? (
        <LiveInk level={recorder.state === "recording" ? recorder.level : 0} />
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
    </Frame>
  );
}

/** The voice written across the whole screen as it happens, line after line, like handwriting. */
function LiveInk({ level }: { level: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pen = useRef({ x: 0, row: 0 });

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ratio = window.devicePixelRatio || 1;
    el.width = el.clientWidth * ratio;
    el.height = el.clientHeight * ratio;
    el.getContext("2d")?.scale(ratio, ratio);
  }, []);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const width = el.clientWidth - 64;
    const rows = Math.max(1, Math.floor((el.clientHeight - 260) / ROW_PX));
    const { x, row } = pen.current;
    const baseline = 64 + (row % rows) * ROW_PX + ROW_PX / 2;
    if (x === 0 && row % rows === 0 && row > 0) ctx.clearRect(0, 0, el.width, el.height);
    const h = Math.max(1.5, Math.min(1, level * 1.6) * ROW_PX * 0.9);
    ctx.fillStyle = `rgba(211, 163, 76, ${0.35 + Math.min(1, level * 2) * 0.65})`;
    ctx.fillRect(32 + x, baseline - h / 2, STEP_PX - 0.5, h);
    pen.current = x + STEP_PX > width ? { x: 0, row: row + 1 } : { x: x + STEP_PX, row };
  }, [level]);

  return (
    <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />
  );
}

function Frame({ corner, children }: { corner: ReactNode; children: ReactNode }) {
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
