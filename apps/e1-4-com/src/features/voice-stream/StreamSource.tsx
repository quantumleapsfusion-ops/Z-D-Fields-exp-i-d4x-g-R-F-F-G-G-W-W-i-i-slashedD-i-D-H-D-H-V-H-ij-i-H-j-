"use client";

import Link from "next/link";

import type { StreamTranscript } from "@/features/voice-stream/useStreamTranscript";

export function StreamSource({ stream }: { stream: StreamTranscript }) {
  return (
    <div className="text-dust flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
      <span>
        {stream.loading
          ? "Loading stream…"
          : `Source: Voice Stream · ${stream.segments.length} segments`}
      </span>
      <button
        type="button"
        disabled={stream.loading}
        onClick={() => void stream.refresh()}
        className="hover:text-chalk underline underline-offset-4 disabled:opacity-50"
      >
        Refresh
      </button>
      {stream.error ? <span className="text-ochre">{stream.error}</span> : null}
      {!stream.loading && !stream.error && !stream.text ? (
        <span>
          Your stream is empty.{" "}
          <Link href="/stream" className="hover:text-chalk underline underline-offset-4">
            Record in 1D Voice Stream →
          </Link>
        </span>
      ) : null}
    </div>
  );
}
