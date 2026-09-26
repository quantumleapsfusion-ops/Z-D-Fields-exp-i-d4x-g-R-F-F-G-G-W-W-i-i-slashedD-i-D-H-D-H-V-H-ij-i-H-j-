"use client";

import { useMemo } from "react";

import { Timeline } from "@/features/voice-stream/Timeline";
import type { Playlist } from "@/lib/audio/store";
import { usePlaylist } from "@/lib/audio/usePlaylist";
import type { SegmentDTO } from "@/lib/voice/stream";

export function SharedStream({
  token,
  segments,
  includeAudio,
  includeTranscript,
}: {
  token: string;
  segments: SegmentDTO[];
  includeAudio: boolean;
  includeTranscript: boolean;
}) {
  const playlist = useMemo<Playlist | null>(
    () =>
      includeAudio && segments.length > 0
        ? {
            key: `share:${token}`,
            title: "Shared stream",
            segments: segments.map((s) => ({
              id: s.id,
              durationMs: s.durationMs,
              transcript: includeTranscript ? s.transcription : null,
            })),
            audioUrl: (id) => `/api/share/${token}/audio/${id}`,
          }
        : null,
    [includeAudio, includeTranscript, segments, token],
  );
  const { activeId, playFrom } = usePlaylist(playlist);

  if (segments.length === 0) {
    return <p className="text-dust mt-8">Nothing here yet.</p>;
  }

  return (
    <div className="mt-8 pb-32">
      {!includeTranscript ? <p className="label mb-6">Audio only</p> : null}
      <Timeline
        items={segments.map((segment) => ({ kind: "segment", segment }))}
        activeId={activeId}
        onPlay={includeAudio ? playFrom : undefined}
      />
    </div>
  );
}
