"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { LiveControls } from "@/features/live/LiveControls";
import { useLiveTranscription } from "@/features/live/useLiveTranscription";
import { EVENT_HORIZON, density, type Superposition } from "@/lib/gravity/superposition";

const TopologyCollapse = dynamic(() => import("./TopologyCollapse"), { ssr: false });

type Phase = "gathering" | "collapsing" | "superposed" | "resolved";

/**
 * Gravity Board (EXPERIMENTAL, flag-gated). Speech accumulates until its density crosses the event
 * horizon; a stochastic step then holds several interpretations at once until one is resolved.
 */
export function GravityBoard({ llmReady }: { llmReady: boolean }) {
  const live = useLiveTranscription();
  const text = live.phrases.map((p) => p.text).join(" ");
  const d = density(text);
  const [phase, setPhase] = useState<Phase>("gathering");
  const [superposition, setSuperposition] = useState<Superposition | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [cycle, setCycle] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const collapsedAt = useRef(-1);

  async function collapse() {
    if (!text) return;
    collapsedAt.current = live.phrases.length;
    setPhase("collapsing");
    setChosen(null);
    setError(null);
    try {
      const res = await fetch("/api/gravity/superpose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: text.slice(-12000) }),
      });
      if (!res.ok) throw new Error(`Superposition failed (${res.status})`);
      setSuperposition((await res.json()) as Superposition);
      setPhase("superposed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Superposition failed");
      setPhase("gathering");
    }
  }

  // Crossing the horizon triggers collapse once per new utterance.
  useEffect(() => {
    if (
      phase === "gathering" &&
      d >= EVENT_HORIZON &&
      live.phrases.length > collapsedAt.current
    ) {
      void collapse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, phase, live.phrases.length]);

  // While superposed, the topology flickers between every candidate's form.
  useEffect(() => {
    if (phase !== "superposed") return;
    const timer = setInterval(() => setCycle((c) => c + 1), 2600);
    return () => clearInterval(timer);
  }, [phase]);

  const candidates = superposition?.candidates ?? [];
  const form =
    phase === "resolved" && chosen !== null
      ? candidates[chosen].form
      : phase === "superposed" && candidates.length
        ? candidates[cycle % candidates.length].form
        : "flat";

  function resolveTo(index: number) {
    setChosen(index);
    setPhase("resolved");
  }

  function reset() {
    live.reset();
    setSuperposition(null);
    setChosen(null);
    setPhase("gathering");
    collapsedAt.current = -1;
  }

  return (
    <div className="flex flex-col gap-6">
      {!llmReady ? (
        <p className="border-ochre/30 bg-ochre/5 text-chalk/80 rounded-xl border px-4 py-3 font-sans text-sm">
          No LLM key — the superposition is sampled by a random stub (“artificial random
          intelligence”). Add an LLM key for model-generated interpretations.
        </p>
      ) : null}

      <LiveControls live={live} placeholder="Say something dense…" />

      <div className="flex items-center gap-4">
        <span className="label w-28 shrink-0">Density</span>
        <div className="bg-chalk/10 relative h-2 flex-1 rounded-full">
          <div
            className="from-dust to-ochre absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-500"
            style={{ width: `${Math.round(d * 100)}%` }}
          />
          <div
            className="bg-chalk absolute -top-1.5 h-5 w-px"
            style={{ left: `${EVENT_HORIZON * 100}%` }}
            title="Event horizon"
          />
        </div>
        <span className="label w-24 text-right">
          {d >= EVENT_HORIZON ? "Past horizon" : `${Math.round(d * 100)}%`}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border-chalk/10 relative h-[26rem] overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_center,#000_0,#0e1a13_60%)]">
          <TopologyCollapse form={form} seed={text.slice(0, 200) || "e1-4"} />
          <span className="label absolute bottom-3 left-3">
            {phase === "gathering"
              ? "Transcript, flat"
              : phase === "collapsing"
                ? "Crossing the event horizon…"
                : phase === "superposed"
                  ? `Superposition · ${form}`
                  : `Resolved · ${form}`}
          </span>
          <span className="label absolute right-3 bottom-3">3D mock-up · not 4D</span>
        </div>

        <div className="flex flex-col gap-3">
          {phase === "gathering" || phase === "collapsing" ? (
            <div className="flex h-full flex-col justify-between gap-4">
              <p className="font-display text-chalk/85 text-xl leading-snug">
                {text || "Nothing said yet. Keep going until the idea gets heavy."}
              </p>
              <button
                type="button"
                disabled={!text || phase === "collapsing"}
                onClick={() => void collapse()}
                className="border-chalk/25 hover:border-ochre hover:text-ochre self-start rounded-full border px-5 py-2 font-sans text-sm disabled:opacity-40"
              >
                {phase === "collapsing" ? "Collapsing…" : "Collapse now"}
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {candidates.map((c, i) => {
                  const isChosen = chosen === i;
                  const faded = phase === "resolved" && !isChosen;
                  return (
                    <button
                      key={`${c.title}-${i}`}
                      type="button"
                      onClick={() => resolveTo(i)}
                      className={`rounded-xl border p-4 text-left transition-all duration-700 ${
                        isChosen
                          ? "border-ochre bg-ochre/10 sm:col-span-2"
                          : faded
                            ? "border-chalk/5 scale-95 opacity-25 blur-[1px]"
                            : "animate-shimmer border-chalk/15 hover:border-chalk/40"
                      }`}
                      style={
                        phase === "superposed"
                          ? { animationDelay: `${i * 400}ms` }
                          : undefined
                      }
                    >
                      <span className="label flex justify-between">
                        <span>{c.form}</span>
                        <span>{Math.round(c.confidence * 100)}%</span>
                      </span>
                      <span className="font-display mt-2 block text-lg">{c.title}</span>
                      <span className="text-chalk/70 mt-1 block font-sans text-sm">
                        {c.interpretation}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3">
                {phase === "superposed" && superposition ? (
                  <button
                    type="button"
                    onClick={() => resolveTo(superposition.resolvedIndex)}
                    className="bg-chalk text-blackboard rounded-full px-5 py-2 font-sans text-sm"
                  >
                    Show me which one I meant
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void collapse()}
                  className="border-chalk/25 hover:border-ochre rounded-full border px-5 py-2 font-sans text-sm"
                >
                  Sample again
                </button>
                <button type="button" onClick={reset} className="label hover:text-chalk">
                  Reset
                </button>
              </div>
              <p className="label">
                Source:{" "}
                {superposition?.source === "llm"
                  ? "LLM (temperature 1.0)"
                  : "random stub"}
              </p>
            </>
          )}
          {error ? <p className="text-ochre font-sans text-sm">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
