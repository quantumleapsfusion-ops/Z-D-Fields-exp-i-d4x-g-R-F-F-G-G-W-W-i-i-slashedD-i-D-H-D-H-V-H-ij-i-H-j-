"use client";

import { useEffect, useRef } from "react";

import { haptic } from "./haptics";

const BUZZ_LEVEL = 0.35;
const BUZZ_GAP_MS = 220;

/** A short buzz on each loud moment of speech, so the phone answers the voice as the beads do. */
export function useVoiceBuzz(level: number) {
  const last = useRef(0);
  useEffect(() => {
    if (level < BUZZ_LEVEL) return;
    const now = performance.now();
    if (now - last.current < BUZZ_GAP_MS) return;
    last.current = now;
    haptic("voice");
  }, [level]);
}
