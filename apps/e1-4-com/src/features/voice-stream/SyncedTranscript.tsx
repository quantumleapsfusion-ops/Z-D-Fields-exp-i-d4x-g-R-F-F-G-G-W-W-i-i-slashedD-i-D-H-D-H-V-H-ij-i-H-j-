"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Word-level transcript reveal in step with playback. Transcripts carry no word timestamps, so
 * each word is placed proportionally to its character offset within the segment's duration.
 */
export function SyncedTranscript({
  text,
  positionMs,
  durationMs,
  className,
}: {
  text: string | null | undefined;
  positionMs: number;
  durationMs: number;
  className?: string;
}) {
  const words = useMemo(() => placeWords(text ?? ""), [text]);

  if (words.length === 0) {
    return (
      <p className={`text-dust font-sans text-sm italic ${className ?? ""}`}>
        No transcript for this part yet.
      </p>
    );
  }

  const progress = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 1;
  const revealed = words.filter((w) => w.at <= progress);
  const activeIndex = revealed.length - 1;

  return (
    <p className={`font-sans text-sm leading-relaxed ${className ?? ""}`} aria-live="off">
      <AnimatePresence initial={false}>
        {revealed.map((w, i) => (
          <motion.span
            key={w.key}
            initial={{ opacity: 0, y: 4, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
            className={i === activeIndex ? "text-chalk" : "text-chalk/70"}
          >
            {w.word}{" "}
          </motion.span>
        ))}
      </AnimatePresence>
      <span className="sr-only">{text}</span>
    </p>
  );
}

function placeWords(text: string): { key: string; word: string; at: number }[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  const total = tokens.reduce((n, w) => n + w.length + 1, 0) || 1;
  const out: { key: string; word: string; at: number }[] = [];
  let acc = 0;
  for (const [i, word] of tokens.entries()) {
    out.push({ key: `${i}-${word}`, word, at: acc / total });
    acc += word.length + 1;
  }
  return out;
}
