"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { haptic } from "@/lib/device/haptics";

const HOLD_MS = 3000;
const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Phase = "idle" | "holding" | "destroying" | "gone" | "failed";

/**
 * Destroys everything this person has here. There is no form and nothing to type: press the mark
 * and keep pressing for three seconds while the ring closes. Letting go early cancels. Works with
 * a finger, a mouse or a held Space bar.
 */
export function HoldToDestroy() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const started = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    started.current = null;
    setProgress(0);
    setPhase((p) => (p === "holding" ? "idle" : p));
  }, []);

  const destroy = useCallback(async () => {
    setPhase("destroying");
    haptic("rejected");
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error(String(res.status));
      setPhase("gone");
      haptic("saved");
      router.replace("/");
      router.refresh();
    } catch {
      setPhase("failed");
      setProgress(0);
    }
  }, [router]);

  const begin = useCallback(() => {
    if (phase === "destroying" || phase === "gone" || started.current !== null) return;
    setPhase("holding");
    started.current = performance.now();
    const tick = () => {
      if (started.current === null) return;
      const elapsed = performance.now() - started.current;
      const ratio = Math.min(1, elapsed / HOLD_MS);
      setProgress(ratio);
      if (ratio >= 1) {
        started.current = null;
        frame.current = null;
        void destroy();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [destroy, phase]);

  useEffect(() => () => cancel(), [cancel]);

  const busy = phase === "destroying" || phase === "gone";
  const status =
    phase === "holding"
      ? "Keep holding. Letting go cancels."
      : phase === "destroying"
        ? "Destroying everything you have here."
        : phase === "gone"
          ? "Everything is gone."
          : phase === "failed"
            ? "Nothing was deleted. Hold again to retry."
            : "Hold for three seconds to destroy all your voice data.";

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Hold for three seconds to destroy all your voice data"
        aria-pressed={phase === "holding"}
        disabled={busy}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          begin();
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault();
            begin();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === " " || e.key === "Enter") cancel();
        }}
        onContextMenu={(e) => e.preventDefault()}
        className="text-ochre focus-visible:ring-ochre relative h-16 w-16 touch-none rounded-full outline-none select-none focus-visible:ring-2 disabled:opacity-50"
      >
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
          <circle
            cx="32"
            cy="32"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.25}
            strokeWidth={2}
          />
          <circle
            cx="32"
            cy="32"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            transform="rotate(-90 32 32)"
          />
          {/* A broken circle: what was whole, taken apart. */}
          <path
            d="M24 24l16 16M40 24L24 40"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={phase === "gone" ? 0.3 : 1}
          />
        </svg>
      </button>
      <p role="status" aria-live="assertive" className="sr-only">
        {status}
      </p>
    </div>
  );
}
