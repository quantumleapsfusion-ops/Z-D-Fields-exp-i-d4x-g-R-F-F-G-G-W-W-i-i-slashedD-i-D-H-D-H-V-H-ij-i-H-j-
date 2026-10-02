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
  const [busy, setBusy] = useState(false);
  const cancel = useRef<(() => void) | null>(null);

  useEffect(() => () => cancel.current?.(), []);

  const listen = async () => {
    cancel.current?.();
    setBusy(true);
    try {
      const res = await fetch(audioUrl);
      const print = res.ok ? await decodeSound([await res.blob()]) : null;
      const said = print ? commentOn(print) : ["I could not hear this entry."];
      setLines(said);
      cancel.current = speak(said, {
        onLine: setLine,
        onWord: () => {},
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
          {lines.map((text, i) => (
            <span key={i} className={i === line ? "text-chalk" : undefined}>
              {text}{" "}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
