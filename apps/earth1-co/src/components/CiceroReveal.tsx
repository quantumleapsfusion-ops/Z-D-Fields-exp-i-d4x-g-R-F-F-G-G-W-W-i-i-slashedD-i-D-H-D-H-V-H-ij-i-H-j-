"use client";

import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useRef, useState } from "react";

import { cicero, lorem } from "@/lib/site";

const GLYPHS = "abcdefghijklmnopqrstuvwxyz";
const SCRAMBLE_WIDTH = 10;
const DECODE_END = 0.7;

function ramp(v: number, from: number, to: number) {
  return Math.min(1, Math.max(0, (v - from) / (to - from)));
}

function glyph(i: number, tick: number) {
  const n = Math.imul(i + 1, 2654435761) ^ Math.imul(tick + 1, 40503);
  return GLYPHS[(n >>> 0) % GLYPHS.length];
}

function DecodingText({ progress }: { progress: number }) {
  const target = cicero.latin;
  const front = Math.round(progress * (target.length + SCRAMBLE_WIDTH));
  const tick = Math.floor(progress * 240);

  return (
    <>
      {Array.from(target, (ch, i) => {
        if (i < front - SCRAMBLE_WIDTH) {
          return (
            <span key={i} className="text-chalk">
              {ch}
            </span>
          );
        }
        if (i < front) {
          return (
            <span key={i} className="text-ochre">
              {ch === " " ? " " : glyph(i, tick)}
            </span>
          );
        }
        const src = lorem[i];
        return src === undefined ? null : (
          <span key={i} className="text-dust/60">
            {src}
          </span>
        );
      })}
    </>
  );
}

export function CiceroReveal() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [scroll, setScroll] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", setScroll);

  const translation = ramp(scroll, 0.72, 0.88);

  const done = reduceMotion ?? false;

  return (
    <section
      ref={ref}
      aria-labelledby="cicero-heading"
      className={done ? "relative" : "relative h-[260vh]"}
    >
      <div
        className={
          done
            ? "mx-auto max-w-5xl px-5 pt-32 pb-24 sm:px-8"
            : "sticky top-0 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 pt-24 pb-16 sm:px-8"
        }
      >
        <h1 id="cicero-heading" className="sr-only">
          {cicero.latin}
        </h1>
        <p
          aria-hidden
          className="font-display text-[1.6rem] leading-[1.25] tracking-tight sm:text-[2.6rem] lg:text-[3.2rem]"
        >
          {done ? cicero.latin : <DecodingText progress={ramp(scroll, 0, DECODE_END)} />}
        </p>
        <div
          className="mt-10 max-w-3xl"
          style={
            done
              ? undefined
              : {
                  opacity: translation,
                  transform: `translateY(${(1 - translation) * 12}px)`,
                }
          }
        >
          <p className="text-chalk/85 font-sans text-lg leading-relaxed sm:text-2xl">
            “{cicero.english}”
          </p>
          <p className="label mt-5">{cicero.citation}</p>
        </div>
        {!done && (
          <p
            aria-hidden
            className="label absolute bottom-10 left-5 sm:left-8"
            style={{ opacity: 1 - ramp(scroll, 0, 0.08) }}
          >
            Scroll to restore
          </p>
        )}
      </div>
    </section>
  );
}
