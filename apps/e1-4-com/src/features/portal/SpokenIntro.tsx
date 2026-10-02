"use client";

import { useEffect } from "react";

import { pickVoice } from "@/features/codex/voice";
import { site } from "@/lib/site";

import { INTRO_KEY, shouldSpeakIntro } from "./intro";

function heard(): boolean {
  try {
    return localStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

function remember() {
  try {
    localStorage.setItem(INTRO_KEY, "1");
  } catch {
    // Private windows may refuse; the intro simply plays again next time.
  }
}

/**
 * The page has no words, so the site introduces itself out loud instead: on the first gesture a
 * device makes at the front door (anywhere but the microphone), the device's own voice says what
 * e1-4 stands for, once. Browsers only allow speech after a gesture, so it cannot play on load.
 */
export function SpokenIntro() {
  useEffect(() => {
    if (!("speechSynthesis" in window) || heard()) return;
    const synth = window.speechSynthesis;

    const onGesture = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      const onMic = Boolean(target?.closest("button"));
      if (!shouldSpeakIntro({ heard: heard(), onMic, speaking: synth.speaking })) return;
      const voice = pickVoice();
      if (!voice) return;
      remember();
      stop();
      for (const line of site.spokenIntro) {
        const utterance = new SpeechSynthesisUtterance(line);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = 0.95;
        synth.speak(utterance);
      }
    };
    const stop = () => {
      document.removeEventListener("pointerdown", onGesture, true);
      document.removeEventListener("keydown", onGesture, true);
    };
    document.addEventListener("pointerdown", onGesture, true);
    document.addEventListener("keydown", onGesture, true);
    return stop;
  }, []);
  return null;
}
