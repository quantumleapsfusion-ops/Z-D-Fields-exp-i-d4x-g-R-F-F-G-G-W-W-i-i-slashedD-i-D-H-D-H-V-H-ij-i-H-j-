"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { LiveControls } from "@/features/live/LiveControls";
import { useLiveTranscription } from "@/features/live/useLiveTranscription";
import type { DrawOp, DrawResponse } from "@/lib/davinci/ops";

import { AnimatedTranscript } from "./AnimatedTranscript";

const DaVinciCanvas = dynamic(() => import("./DaVinciCanvas"), {
  ssr: false,
  loading: () => <div className="aspect-[1000/640] w-full" />,
});

const DRAW_DEBOUNCE_MS = 900;
const LANGUAGES = [
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Mandarin Chinese",
  "Arabic",
  "Hindi",
];

export function DaVinciApp({
  llmReady,
  layout = "page",
}: {
  llmReady: boolean;
  layout?: "page" | "drawer";
}) {
  const live = useLiveTranscription();
  const [ops, setOps] = useState<DrawOp[]>([]);
  const [caption, setCaption] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [translation, setTranslation] = useState<{ lang: string; text: string } | null>(
    null,
  );
  const [translateError, setTranslateError] = useState<string | null>(null);

  const drawnUpTo = useRef(0);
  const inFlight = useRef(false);
  const opsRef = useRef<DrawOp[]>([]);
  useEffect(() => {
    opsRef.current = ops;
  }, [ops]);

  const requestDrawing = useCallback(async () => {
    if (inFlight.current) return;
    const pending = live.phrases.slice(drawnUpTo.current);
    if (pending.length === 0) return;
    inFlight.current = true;
    setDrawing(true);
    const upTo = live.phrases.length;
    try {
      const res = await fetch("/api/davinci/draw", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transcript: live.phrases
            .map((p) => p.text)
            .join(" ")
            .slice(-20000),
          newText: pending
            .map((p) => p.text)
            .join(" ")
            .slice(-4000),
          existing: opsRef.current.slice(-400),
        }),
      });
      if (!res.ok) throw new Error("Drawing failed.");
      const data = (await res.json()) as DrawResponse;
      drawnUpTo.current = upTo;
      setOps((prev) => [...prev, ...data.ops]);
      setCaption(data.caption);
    } catch (error) {
      setCaption(error instanceof Error ? error.message : "Drawing failed");
    } finally {
      inFlight.current = false;
      setDrawing(false);
    }
  }, [live.phrases]);

  useEffect(() => {
    if (live.phrases.length <= drawnUpTo.current) return;
    const timer = setTimeout(() => void requestDrawing(), DRAW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [live.phrases, drawing, requestDrawing]);

  async function translate(lang: string) {
    setTranslateError(null);
    const text = live.phrases.map((p) => p.text).join("\n");
    if (!text) return;
    const res = await fetch("/api/davinci/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: text.slice(-8000), target: lang }),
    });
    const data = (await res.json()) as { text?: string };
    if (!res.ok || !data.text) setTranslateError("Translation unavailable.");
    else setTranslation({ lang, text: data.text });
  }

  function clearAll() {
    live.reset();
    drawnUpTo.current = 0;
    setOps([]);
    setCaption("");
    setTranslation(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <LiveControls live={live} placeholder="Describe something to draw..." />

      <div
        className={`grid grid-cols-[minmax(0,1fr)] gap-8 ${
          layout === "drawer" ? "" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        }`}
      >
        <AnimatedTranscript phrases={live.phrases} interim={live.interim} />

        <figure className="flex min-w-0 flex-col gap-2">
          <div className="chalk-surface border-chalk/10 overflow-hidden rounded-2xl border">
            <DaVinciCanvas ops={ops} />
          </div>
          <figcaption className="flex items-center justify-between gap-3">
            <span className={`label ${drawing ? "animate-shimmer text-ochre" : ""}`}>
              {drawing ? "Drawing..." : caption || "Speak to draw."}
            </span>
          </figcaption>
        </figure>
      </div>

      <div className="border-chalk/10 flex flex-wrap items-center gap-2 border-t pt-6">
        <span className="label mr-2">Translate</span>
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            type="button"
            disabled={!llmReady || live.phrases.length === 0}
            onClick={() => void translate(lang)}
            className="border-chalk/15 text-chalk/80 hover:border-ochre hover:text-ochre rounded-full border px-3 py-1 font-sans text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {lang}
          </button>
        ))}
        <button
          type="button"
          onClick={clearAll}
          className="text-dust hover:text-chalk ml-auto rounded-full px-3 py-1 font-sans text-xs"
        >
          Clear
        </button>
      </div>
      {translateError ? (
        <p className="text-ochre font-sans text-sm">{translateError}</p>
      ) : null}
      {translation ? (
        <div className="animate-ink-in">
          <p className="label mb-2">{translation.lang}</p>
          <p className="font-display text-2xl leading-snug whitespace-pre-line">
            {translation.text}
          </p>
        </div>
      ) : null}
    </div>
  );
}
