"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { cicero } from "@/lib/site";

/** How much scroll (as a fraction of the viewport height) it takes to fully decode. */
const SCROLL_SPAN = 0.6;
/** With no scroll activity for this long, decoding continues on its own. */
const IDLE_MS = 3000;
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

/**
 * Scramble-to-Cicero reveal. The server renders the plain placeholder; decoding runs on the
 * client in a requestAnimationFrame loop that only runs while the block is on screen and the
 * tab is visible. Progress comes from scroll position, or from an idle timer once scrolling
 * pauses. The scramble is deterministic (indexed by position and frame), never random.
 */
export function CiceroReveal() {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [tick, setTick] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  const { placeholder, latin, english, citation } = cicero;
  const length = latin.length;
  const done = reduced || progress >= 1;

  useEffect(() => {
    if (done) return;
    const el = root.current;
    if (!el) return;

    let frame = 0;
    let visible = false;
    let lastScrollY = window.scrollY;
    let lastScrollAt = performance.now();
    let idleFrom: { at: number; progress: number } | null = null;
    let current = 0;

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const loop = (now: number) => {
      frame = 0;
      const scrollY = window.scrollY;
      if (scrollY !== lastScrollY) {
        lastScrollY = scrollY;
        lastScrollAt = now;
        idleFrom = null;
      }
      const fromScroll = Math.min(1, scrollY / (window.innerHeight * SCROLL_SPAN));

      if (now - lastScrollAt > IDLE_MS) idleFrom ??= { at: now, progress: current };
      const fromIdle = idleFrom
        ? idleFrom.progress +
          ((now - idleFrom.at) / IDLE_DURATION_MS) * (1 - idleFrom.progress)
        : 0;

      current = Math.min(1, Math.max(current, fromScroll, fromIdle));
      setProgress(current);
      if (current >= 1) return;
      if (current > 0) setTick((t) => (t + 1) % 1000);
      schedule();
    };

    const schedule = () => {
      if (!frame && visible && document.visibilityState === "visible") {
        frame = requestAnimationFrame(loop);
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          lastScrollAt = performance.now();
          schedule();
        } else stop();
      },
      { threshold: 0 },
    );
    io.observe(el);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        lastScrollAt = performance.now();
        schedule();
      } else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [done]);

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

  const typeClass =
    "font-display text-[1.375rem] leading-[1.35] font-light tracking-tight sm:text-[1.75rem] lg:text-[2.125rem]";

  return (
    <div ref={root} className="max-w-3xl">
      <p className="label mb-8">The one bold gesture</p>
      {/* Both strings share one grid cell so the block keeps the taller height while decoding. */}
      <div className="grid">
        <blockquote
          lang="la"
          aria-label={latin}
          className={`${typeClass} [grid-area:1/1]`}
        >
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
        </blockquote>
        <p aria-hidden className={`${typeClass} invisible [grid-area:1/1]`}>
          {latin.length >= placeholder.length ? latin : placeholder}
        </p>
      </div>

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
