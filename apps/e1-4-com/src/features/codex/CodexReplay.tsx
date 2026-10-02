"use client";

import { useEffect, useRef, useState } from "react";

import { decodeSound } from "@/features/sound/decode";
import { haptic } from "@/lib/device/haptics";
import { commentOn } from "@/lib/sound/commentary";

import { speak } from "./voice";

/** Replays what the Codex says about one saved entry, measured again from its original audio. */
export function CodexReplay({ audioUrl }: { audioUrl: string }) {
  const [lines, setLines] = useState<string[] | null>(null);
  const [line, setLine] = useState(-1);
  const [word, setWord] = useState(-1);
  const [busy, setBusy] = useState(false);
  const cancel = useRef<(() => void) | null>(null);
  const wordIndex = useRef(0);

  useEffect(() => () => cancel.current?.(), []);

  const listen = async () => {
    cancel.current?.();
    setBusy(true);
    wordIndex.current = 0;
    try {
      const res = await fetch(audioUrl);
      const print = res.ok ? await decodeSound([await res.blob()]) : null;
      const said = print ? commentOn(print) : ["I could not hear this entry."];
      setLines(said);
      cancel.current = speak(said, {
        onLine: (index) => {
          wordIndex.current = 0;
          setLine(index);
          setWord(-1);
        },
        onWord: () => {
          setWord(wordIndex.current);
          wordIndex.current += 1;
        },
        onEnd: () => setBusy(false),
      });
    } catch {
      setLines(["I could not hear this entry."]);
      setBusy(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => {
          haptic("play");
          void listen();
        }}
        disabled={busy}
        className="text-ochre text-sm disabled:opacity-60"
      >
        {busy ? "The Codex is speaking…" : "Hear the Codex on this entry"}
      </button>
      {lines ? (
        <p className="text-chalk/80 mt-2 font-sans text-sm leading-relaxed">
          {lines.map((text, lineIdx) => {
            const isCurrentLine = lineIdx === line;
            const words = text.split(/\s+/);
            return (
              <span key={lineIdx} className={!isCurrentLine ? "text-chalk/60" : undefined}>
                {words.map((w, wordIdx) => (
                  <span
                    key={wordIdx}
                    className={
                      isCurrentLine && wordIdx === word
                        ? "text-ochre font-medium transition-colors"
                        : isCurrentLine
                          ? "text-chalk"
                          : undefined
                    }
                  >
                    {w}{" "}
                  </span>
                ))}
              </span>
            );
          })}
        </p>
      ) : null}
    </div>
  );
}
