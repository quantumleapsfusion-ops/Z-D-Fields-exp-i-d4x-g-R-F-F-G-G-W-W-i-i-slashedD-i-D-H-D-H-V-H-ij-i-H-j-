"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { LiveControls } from "@/features/live/LiveControls";
import { useLiveTranscription } from "@/features/live/useLiveTranscription";
import { StreamSource } from "@/features/voice-stream/StreamSource";
import { useStreamTranscript } from "@/features/voice-stream/useStreamTranscript";
import type { Superposition } from "@/lib/gravity/superposition";
import { haptic } from "@/lib/device/haptics";

const TopologyCollapse = dynamic(() => import("@/features/gravity/TopologyCollapse"), {
  ssr: false,
});

type Phase = "idle" | "sampling" | "superposed" | "resolved";

export function SuperpositionBoard() {
  const stream = useStreamTranscript();
  const live = useLiveTranscription();
  const [phase, setPhase] = useState<Phase>("idle");
  const [superposition, setSuperposition] = useState<Superposition | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [cycle, setCycle] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const text = [stream.text, ...live.phrases.map((phrase) => phrase.text)]
    .filter(Boolean)
    .join(" ")
    .trim();

  async function sample() {
    if (!text) return;
    setPhase("sampling");
    setChosen(null);
    setError(null);
    try {
      const response = await fetch("/api/gravity/superpose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: text.slice(-12000) }),
      });
      if (!response.ok) throw new Error("Could not superpose stream.");
      setSuperposition((await response.json()) as Superposition);
      setPhase("superposed");
    } catch (sampleError) {
      setError(
        sampleError instanceof Error
          ? sampleError.message
          : "Could not superpose stream.",
      );
      setPhase("idle");
    }
  }

  useEffect(() => {
    if (phase !== "superposed") return;
    const timer = setInterval(() => setCycle((current) => current + 1), 2600);
    return () => clearInterval(timer);
  }, [phase]);

  const candidates = superposition?.candidates ?? [];
  const form =
    phase === "resolved" && chosen !== null
      ? (candidates[chosen]?.form ?? "flat")
      : phase === "superposed" && candidates.length
        ? candidates[cycle % candidates.length].form
        : "flat";

  function reset() {
    live.reset();
    setSuperposition(null);
    setChosen(null);
    setError(null);
    setPhase("idle");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <StreamSource stream={stream} />
        <LiveControls live={live} placeholder="Add a live phrase..." />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border-chalk/10 relative h-[26rem] overflow-hidden rounded-2xl border bg-black">
          <TopologyCollapse form={form} seed={text.slice(0, 200) || "e1-4"} />
          <span className="label absolute bottom-3 left-3">
            {phase === "resolved"
              ? `Resolved · ${form}`
              : phase === "superposed"
                ? `Superposition · ${form}`
                : "Ari"}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-display text-chalk/85 min-h-20 text-xl leading-snug">
            {text || "Your stream is empty."}
          </p>
          {phase === "idle" || phase === "sampling" ? (
            <button
              type="button"
              disabled={!text || phase === "sampling"}
              onClick={() => {
                haptic("stage");
                void sample();
              }}
              className="bg-chalk text-blackboard self-start rounded-full px-5 py-2 font-sans text-sm disabled:opacity-40"
            >
              {phase === "sampling"
                ? "Sampling..."
                : stream.text
                  ? "Superpose my stream"
                  : "Sample superposition"}
            </button>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {candidates.map((candidate, index) => {
                  const isChosen = chosen === index;
                  const faded = phase === "resolved" && !isChosen;
                  return (
                    <button
                      key={`${candidate.title}-${index}`}
                      type="button"
                      onClick={() => {
                        haptic("accepted");
                        setChosen(index);
                        setPhase("resolved");
                      }}
                      className={`rounded-xl border p-4 text-left transition-all duration-700 ${
                        isChosen
                          ? "border-ochre bg-ochre/10 sm:col-span-2"
                          : faded
                            ? "border-chalk/5 scale-95 opacity-25 blur-[1px]"
                            : "animate-shimmer border-chalk/15 hover:border-chalk/40"
                      }`}
                      style={
                        phase === "superposed"
                          ? { animationDelay: `${index * 400}ms` }
                          : undefined
                      }
                    >
                      <span className="label flex justify-between">
                        <span>{candidate.form}</span>
                        <span>{Math.round(candidate.confidence * 100)}%</span>
                      </span>
                      <span className="font-display mt-2 block text-lg">
                        {candidate.title}
                      </span>
                      <span className="text-chalk/70 mt-1 block font-sans text-sm">
                        {candidate.interpretation}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3">
                {phase === "superposed" && superposition ? (
                  <button
                    type="button"
                    onClick={() => {
                      haptic("accepted");
                      setChosen(superposition.resolvedIndex);
                      setPhase("resolved");
                    }}
                    className="bg-chalk text-blackboard rounded-full px-5 py-2 font-sans text-sm"
                  >
                    Resolve
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    haptic("stage");
                    void sample();
                  }}
                  className="border-chalk/25 hover:border-ochre rounded-full border px-5 py-2 font-sans text-sm"
                >
                  {stream.text ? "Superpose my stream" : "Sample again"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptic("rejected");
                    reset();
                  }}
                  className="label hover:text-chalk"
                >
                  Reset
                </button>
              </div>
            </>
          )}
          {superposition ? (
            <p className="label">
              Source: {stream.text ? "Voice Stream" : "Live phrases"}
            </p>
          ) : null}
          {error ? <p className="text-ochre font-sans text-sm">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
