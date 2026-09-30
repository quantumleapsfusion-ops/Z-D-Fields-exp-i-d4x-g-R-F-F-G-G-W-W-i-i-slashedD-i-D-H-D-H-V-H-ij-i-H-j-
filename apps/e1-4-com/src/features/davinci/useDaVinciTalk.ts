"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { speak } from "@/features/codex/voice";
import { MAX_TURNS, type Turn } from "@/lib/davinci/talk";

export type TalkPhase = "idle" | "listening" | "thinking" | "speaking";

const HISTORY_KEY = "e14.davinci.talk";
const SETTLE_MS = 900;

function loadHistory(): Turn[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as Turn[]).slice(-MAX_TURNS) : [];
  } catch {
    return [];
  }
}

function saveHistory(turns: Turn[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(turns.slice(-MAX_TURNS)));
  } catch {}
}

/**
 * Da Vinci's side of a spoken turn: hears the words on the device while you speak, then answers
 * out loud. The conversation carries on across turns (and reloads) on this device.
 */
export function useDaVinciTalk() {
  const [phase, setPhase] = useState<TalkPhase>("idle");
  const [pulse, setPulse] = useState(0);
  const [reply, setReply] = useState("");
  const recognition = useRef<SpeechRecognition | null>(null);
  const finals = useRef<string[]>([]);
  const interim = useRef("");
  const want = useRef(false);
  const ended = useRef<(() => void) | null>(null);
  const cancelSpeech = useRef<() => void>(() => {});

  useEffect(
    () => () => {
      want.current = false;
      recognition.current?.abort();
      cancelSpeech.current();
    },
    [],
  );

  /** Call from the tap that starts recording: starts hearing words and unlocks speech on iOS. */
  const listen = useCallback(() => {
    cancelSpeech.current();
    finals.current = [];
    interim.current = "";
    setReply("");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    }
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setPhase("listening");
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-US";
    rec.onresult = (event) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finals.current.push(result[0].transcript.trim());
        else pending += result[0].transcript;
      }
      interim.current = pending.trim();
    };
    rec.onerror = () => {};
    rec.onend = () => {
      if (want.current) {
        try {
          rec.start();
          return;
        } catch {}
      }
      ended.current?.();
    };
    want.current = true;
    recognition.current = rec;
    try {
      rec.start();
    } catch {
      want.current = false;
      recognition.current = null;
    }
  }, []);

  /** Stops hearing and resolves with everything said (after late results settle). */
  const stopListening = useCallback(async (): Promise<string> => {
    want.current = false;
    const rec = recognition.current;
    recognition.current = null;
    if (rec) {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, SETTLE_MS);
        ended.current = () => {
          clearTimeout(timer);
          resolve();
        };
        rec.stop();
      });
      ended.current = null;
    }
    return [...finals.current, interim.current].filter(Boolean).join(" ").trim();
  }, []);

  /** Da Vinci answers `said` out loud; resolves once she has finished speaking. */
  const answer = useCallback(async (said: string): Promise<void> => {
    let text: string;
    if (!said) {
      text = "I heard you, but not the words. Say it to me again?";
    } else {
      setPhase("thinking");
      const history = loadHistory();
      try {
        const res = await fetch("/api/davinci/talk", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ said, history }),
        });
        const body = (await res.json().catch(() => ({}))) as { reply?: string };
        text = body.reply || "I'm here. Say that again?";
      } catch {
        text = "I lost you for a second. Say that again?";
      }
      saveHistory([
        ...history,
        { role: "you", text: said.slice(0, 2000) },
        { role: "davinci", text: text.slice(0, 2000) },
      ]);
    }
    setReply(text);
    setPhase("speaking");
    await new Promise<void>((resolve) => {
      cancelSpeech.current = speak([text], {
        onLine: () => {},
        onWord: () => setPulse((p) => p + 1),
        onEnd: resolve,
      });
    });
    setPhase("idle");
  }, []);

  const silence = useCallback(() => {
    cancelSpeech.current();
    setPhase("idle");
  }, []);

  return { phase, pulse, reply, listen, stopListening, answer, silence };
}
