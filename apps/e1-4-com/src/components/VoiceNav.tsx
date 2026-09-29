"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  useLiveTranscription,
  type FinalPhrase,
} from "@/features/live/useLiveTranscription";
import { signOut } from "@/lib/auth/actions";
import { HELP_TEXT, parseNavCommand } from "@/lib/voice/commands";

const IDLE_MS = 12_000;

/**
 * Voice is the site's navigation. A single mic pinned to every page: tap it (or
 * press V) and say where to go — "chalkboard", "open my stream", "go back",
 * "sign out". Links still exist for pointer users; this is the primary way.
 */
export function VoiceNav({ bare }: { bare: boolean }) {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRef = useRef<() => void>(() => {});

  const say = useCallback((text: string, ms = 2600) => {
    setToast(text);
    window.setTimeout(() => setToast((t) => (t === text ? null : t)), ms);
  }, []);

  const armIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => stopRef.current(), IDLE_MS);
  }, []);

  const onPhrase = useCallback(
    (p: FinalPhrase) => {
      const cmd = parseNavCommand(p.text);
      switch (cmd.kind) {
        case "navigate":
          say(`→ ${cmd.target.label}`);
          stopRef.current();
          router.push(cmd.target.href);
          return;
        case "back":
          say("← back");
          stopRef.current();
          router.back();
          return;
        case "sign-out":
          say("Goodbye, Earthling.");
          stopRef.current();
          void signOut();
          return;
        case "help":
          say(HELP_TEXT, 6000);
          armIdle();
          return;
        case "unknown":
          say(`Didn't catch a place in “${p.text.trim()}”. ${HELP_TEXT}`, 5000);
          armIdle();
      }
    },
    [armIdle, router, say],
  );

  const live = useLiveTranscription(onPhrase);
  useEffect(() => {
    stopRef.current = live.stop;
  }, [live.stop]);

  const toggle = useCallback(() => {
    if (live.listening) {
      live.stop();
      return;
    }
    void live.start().then(armIdle);
  }, [armIdle, live]);

  useEffect(() => {
    if (!live.listening && idleTimer.current) clearTimeout(idleTimer.current);
  }, [live.listening]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "v" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  if (!live.supported) return null;

  const position = bare
    ? "left-4 bottom-6"
    : "left-4 bottom-20 md:left-[5.5rem] md:bottom-6";

  return (
    <div className={`fixed z-40 flex items-end gap-3 ${position}`}>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={live.listening}
        aria-label={live.listening ? "Stop listening" : "Speak to navigate (V)"}
        title={live.listening ? "Listening — say where to go" : "Speak to navigate (V)"}
        className={`flex h-12 items-center gap-2 rounded-full border px-4 font-sans text-sm shadow-lg backdrop-blur transition-colors ${
          live.listening
            ? "bg-ochre border-ochre text-blackboard"
            : "border-chalk/25 bg-blackboard/90 text-chalk hover:border-ochre hover:text-ochre"
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full ${
            live.listening ? "bg-blackboard animate-pulse" : "bg-ochre"
          }`}
        />
        {live.listening ? "Say where to go" : "Speak"}
      </button>
      {toast || (live.listening && live.interim) ? (
        <p
          role="status"
          className="border-chalk/15 bg-blackboard/90 text-chalk/85 max-w-xs rounded-(--radius-board) border px-3 py-2 font-sans text-xs shadow-lg backdrop-blur"
        >
          {toast ?? `“${live.interim}”`}
        </p>
      ) : null}
    </div>
  );
}
