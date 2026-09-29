"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  useLiveTranscription,
  type FinalPhrase,
} from "@/features/live/useLiveTranscription";
import { signOut } from "@/lib/auth/actions";
import { enabledFeatures } from "@/lib/features";
import { DESTINATIONS, parseVoiceCommand } from "@/lib/voice-nav/commands";

const LISTEN_MS = 8000;

const isEnabled = (href: string) =>
  !["/stream", "/davinci", "/chalkboard", "/gravity"].includes(href) ||
  enabledFeatures().some((f) => f.href === href);

/**
 * Spoken navigation: tap (or press Alt+V), say where to go. Listens for one command at a time and
 * only after the user asks, so it never competes with Voice Stream or the chalkboard for the mic.
 */
export function VoiceNavigator({ variant }: { variant: "rail" | "tab" | "pill" }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRef = useRef<() => void>(() => {});

  const onPhrase = useCallback(
    (phrase: FinalPhrase) => {
      stopRef.current();
      const command = parseVoiceCommand(phrase.text, isEnabled);
      setShowHelp(command?.kind === "help" || command === null);
      if (!command) setFeedback(`“${phrase.text}” — try “open chalkboard”.`);
      else if (command.kind === "go") {
        setFeedback(`Opening ${command.label}`);
        router.push(command.href);
      } else if (command.kind === "back") {
        setFeedback("Going back");
        router.back();
      } else if (command.kind === "signOut") {
        setFeedback("Signing out");
        void signOut();
      } else setFeedback("You can say:");
    },
    [router],
  );

  const live = useLiveTranscription(onPhrase);
  const { listening, start, stop, interim, error } = live;

  const halt = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    stop();
  }, [stop]);

  useEffect(() => {
    stopRef.current = halt;
  }, [halt]);

  const toggle = useCallback(() => {
    if (listening) return halt();
    setFeedback(null);
    setShowHelp(false);
    void start();
    timeout.current = setTimeout(halt, LISTEN_MS);
  }, [halt, listening, start]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  useEffect(() => {
    if (!feedback || listening) return;
    const t = setTimeout(() => {
      setFeedback(null);
      setShowHelp(false);
    }, 5000);
    return () => clearTimeout(t);
  }, [feedback, listening]);

  const label = listening ? "Stop listening" : "Speak to navigate";
  const glyph = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      className="relative"
    >
      <rect x="9" y="3" width="6" height="12" rx="3" strokeWidth="1.6" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
  const tone = listening ? "text-ochre" : "text-dust hover:text-chalk";

  return (
    <>
      {variant === "pill" ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          aria-pressed={listening}
          className={`border-chalk/20 hover:border-ochre flex items-center gap-2 rounded-full border px-3 py-1 font-sans text-sm transition-colors ${tone}`}
        >
          {glyph}
          <span className="hidden sm:inline">{listening ? "Listening" : "Speak"}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          aria-pressed={listening}
          className={`relative flex flex-col items-center gap-1 rounded-lg px-2 transition-colors ${tone} ${
            variant === "tab" ? "w-full py-2.5" : "mb-3 w-14 py-2"
          }`}
        >
          {glyph}
          <span className="relative font-mono text-[0.6rem] tracking-[0.12em] uppercase">
            {listening ? "Listening" : "Speak"}
          </span>
        </button>
      )}

      <AnimatePresence>
        {listening || feedback || error ? (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-chalk/15 bg-board-2/95 text-chalk fixed top-4 left-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 rounded-(--radius-board) border px-4 py-3 text-center font-sans text-sm shadow-2xl backdrop-blur"
          >
            <p>
              {error ?? (listening ? interim || "Listening… say where to go" : feedback)}
            </p>
            {showHelp ? (
              <p className="text-dust mt-2 text-xs">
                {DESTINATIONS.filter((d) => isEnabled(d.href))
                  .map((d) => `“${d.phrases[0]}”`)
                  .join(" · ")}{" "}
                · “go back” · “sign out”
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
