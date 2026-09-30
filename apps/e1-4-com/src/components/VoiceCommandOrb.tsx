"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { parseVoiceCommand, voiceDestinations } from "@/lib/voice/commands";

const noopSubscribe = () => () => {};
const hasSpeechRecognition = () =>
  Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);

const hint = "Say home, log in, profile, stream, Da Vinci, chalkboard, or gravity.";

export function VoiceCommandOrb() {
  const router = useRouter();
  const recognition = useRef<SpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const supported = useSyncExternalStore(
    noopSubscribe,
    hasSpeechRecognition,
    () => false,
  );
  const hintId = useId();
  const [status, setStatus] = useState("");

  useEffect(() => {
    return () => recognition.current?.abort();
  }, []);

  function toggle() {
    if (recognition.current) {
      recognition.current.stop();
      return;
    }
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    const session = new Ctor();
    recognition.current = session;
    session.continuous = false;
    session.interimResults = false;
    session.lang = navigator.language || "en-US";
    session.onresult = (event) => {
      const command = parseVoiceCommand(event.results[event.resultIndex][0].transcript);
      if (command) {
        setStatus(`Opening ${command}`);
        router.push(voiceDestinations[command]);
      } else {
        setStatus(hint);
      }
    };
    session.onerror = () => setStatus("Could not hear you. Try again or use the links.");
    session.onend = () => {
      recognition.current = null;
      setListening(false);
    };
    try {
      session.start();
      setListening(true);
      setStatus(`Listening. ${hint}`);
    } catch {
      recognition.current = null;
      setStatus("Microphone unavailable. Use the links instead.");
    }
  }

  return (
    <div className="fixed right-4 bottom-36 z-40 md:bottom-24">
      <button
        type="button"
        disabled={!supported}
        aria-label={listening ? "Stop listening" : "Voice navigation"}
        aria-describedby={hintId}
        aria-pressed={listening}
        onClick={toggle}
        className="voice-command-orb border-chalk/25 focus-visible:outline-ochre relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border shadow-lg focus-visible:outline-2 disabled:opacity-40"
      >
        <svg
          viewBox="0 0 24 24"
          className="text-chalk relative h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" />
        </svg>
        {listening ? (
          <span className="bg-ochre absolute right-2 bottom-2 h-2 w-2 animate-pulse rounded-full" />
        ) : null}
      </button>
      <p id={hintId} className="sr-only">
        {hint} Voice recognition does not verify identity.
      </p>
      <p role="status" className="sr-only">
        {status}
      </p>
    </div>
  );
}
