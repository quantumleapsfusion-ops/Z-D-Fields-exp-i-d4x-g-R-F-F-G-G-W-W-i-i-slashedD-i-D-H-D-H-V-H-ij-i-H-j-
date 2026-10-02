"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LiveControls } from "@/features/live/LiveControls";
import { useLiveTranscription } from "@/features/live/useLiveTranscription";
import { StreamSource } from "@/features/voice-stream/StreamSource";
import { useStreamTranscript } from "@/features/voice-stream/useStreamTranscript";
import { EVENT_HORIZON, density } from "@/lib/gravity/superposition";
import { haptic } from "@/lib/device/haptics";

const TopologyCollapse = dynamic(() => import("@/features/gravity/TopologyCollapse"), {
  ssr: false,
});

export function EventHorizon() {
  const router = useRouter();
  const live = useLiveTranscription();
  const stream = useStreamTranscript();
  const [manuallyCrossed, setManuallyCrossed] = useState(false);
  const text = [stream.text, ...live.phrases.map((phrase) => phrase.text)]
    .filter(Boolean)
    .join(" ")
    .trim();
  const score = density(text);
  const crossed = manuallyCrossed || score >= EVENT_HORIZON;

  function cross() {
    if (!text) return;
    haptic("accepted");
    setManuallyCrossed(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <StreamSource stream={stream} />
      <div className="flex flex-col gap-3">
        <LiveControls live={live} placeholder="Add a live phrase..." />
      </div>

      <div className="flex items-center gap-4">
        <span className="label w-28 shrink-0">Density</span>
        <div className="bg-chalk/10 relative h-2 flex-1 rounded-full">
          <div
            className="from-dust to-ochre absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-500"
            style={{ width: `${Math.round(score * 100)}%` }}
          />
          <div
            className="bg-chalk absolute -top-1.5 h-5 w-px"
            style={{ left: `${EVENT_HORIZON * 100}%` }}
            title="Event horizon"
          />
        </div>
        <span className="label w-24 text-right">
          {crossed ? "Past horizon" : `${Math.round(score * 100)}%`}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border-chalk/10 relative h-[26rem] overflow-hidden rounded-2xl border bg-black">
          <TopologyCollapse
            form={crossed ? "sphere" : "flat"}
            seed={text.slice(0, 200) || "e1-4"}
          />
          <span className="label absolute bottom-3 left-3">
            {crossed ? "Singularity · sphere" : "Gathering · flat"}
          </span>
        </div>

        <div className="flex min-h-[20rem] flex-col justify-between gap-6">
          <p className="font-display text-chalk/85 text-xl leading-snug">
            {text || "Your stream is empty."}
          </p>
          {!crossed ? (
            <button
              type="button"
              disabled={!text}
              onClick={cross}
              className="border-chalk/25 hover:border-ochre hover:text-ochre self-start rounded-full border px-5 py-2 font-sans text-sm disabled:opacity-40"
            >
              Collapse now
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                haptic("play");
                router.push(`/superposition${window.location.search}`);
              }}
              className="bg-chalk text-blackboard self-start rounded-full px-5 py-2 font-sans text-sm"
            >
              Cross into superposition (5D)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
