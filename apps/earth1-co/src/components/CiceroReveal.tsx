"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { cicero } from "@/lib/site";

/** How much scroll (as a fraction of the viewport height) it takes to fully decode. */
const SCROLL_SPAN = 0.6;
/** If the visitor never scrolls, start decoding on its own after this long. */
const IDLE_MS = 3500;
const IDLE_DURATION_MS = 4200;
/** Characters just ahead of the decode front shimmer through this alphabet. */
const NOISE = "abcdefghijklmnopqrstuvwxyz";
const FRONT = 6;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

export function CiceroReveal() {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [tick, setTick] = useState(0);
  const idleStart = useRef<number | null>(null);
  const scrolled = useRef(false);

  const { placeholder, latin, english, citation } = cicero;
  const length = latin.length;

  useEffect(() => {
    if (reduced) return;

    let frame = 0;
    const mounted = performance.now();

    const loop = (now: number) => {
      const fromScroll = Math.min(1, window.scrollY / (window.innerHeight * SCROLL_SPAN));
      if (fromScroll > 0) scrolled.current = true;

      if (!scrolled.current && now - mounted > IDLE_MS) idleStart.current ??= now;
      const fromIdle =
        idleStart.current === null
          ? 0
          : Math.min(1, (now - idleStart.current) / IDLE_DURATION_MS);

      const next = Math.max(fromScroll, fromIdle);
      setProgress((prev) => Math.max(prev, next));
      if (next >= 1) return;
      setTick((t) => (t + 1) % 1000);
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  const done = reduced || progress >= 1;
  const resolved = done ? length : Math.floor(progress * length);

  const text = useMemo(() => {
    if (done) return latin;
    if (progress === 0) return placeholder;
    const out: string[] = [latin.slice(0, resolved)];
    const frontEnd = Math.min(length, resolved + FRONT);
    for (let i = resolved; i < frontEnd; i++) {
      out.push(latin[i] === " " ? " " : NOISE[(i * 7 + tick * 3) % NOISE.length]);
    }
    // The placeholder tail shrinks in proportion, so the line starts as plain lorem ipsum.
    out.push(placeholder.slice(Math.round((frontEnd * placeholder.length) / length)));
    return out.join("");
  }, [done, latin, length, placeholder, progress, resolved, tick]);

  return (
    <div className="max-w-3xl">
      <p className="label mb-8">The one bold gesture</p>
      <p
        lang="la"
        aria-live="off"
        className="font-display text-[1.375rem] leading-[1.35] font-light tracking-tight sm:text-[1.75rem] lg:text-[2.125rem]"
      >
        <span className="sr-only">{latin}</span>
        <span aria-hidden className="text-text-3">
          {done ? (
            <span className="text-text">{latin}</span>
          ) : (
            <>
              <span className="text-text">{text.slice(0, resolved)}</span>
              {text.slice(resolved)}
            </>
          )}
        </span>
      </p>

      <div
        className="transition-opacity duration-1000 ease-out"
        style={{ opacity: done ? 1 : 0 }}
        aria-hidden={!done}
      >
        <p className="text-text-2 mt-8 max-w-2xl font-sans text-base leading-relaxed sm:text-lg">
          {english}
        </p>
        <p className="label text-accent mt-6">{citation}</p>
      </div>
    </div>
  );
}
