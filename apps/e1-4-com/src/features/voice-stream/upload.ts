"use client";

import { blobToPcm16 } from "@/features/voice-id/pcm";
import type { SegmentDTO } from "@/lib/voice/stream";

import type { CapturedSpan } from "./useRecorder";

/** Shortest span worth checking against the speaker's voiceprint. */
const VOICE_SAMPLE_MIN_MS = 1500;

/**
 * Appends one span to the signed-in user's stream. Spans long enough to identify a speaker also
 * carry their PCM so the server can check the entry was spoken by the stream's owner.
 */
export async function uploadSpan(span: CapturedSpan): Promise<SegmentDTO> {
  const form = new FormData();
  form.append("audio", span.blob);
  form.append("startedAt", span.startedAt.toISOString());
  form.append("endedAt", span.endedAt.toISOString());
  form.append("durationMs", String(Math.round(span.durationMs)));
  if (span.durationMs >= VOICE_SAMPLE_MIN_MS) {
    const pcm = await blobToPcm16(span.blob);
    if (pcm) form.append("voice", new Blob([pcm], { type: "application/octet-stream" }));
  }
  const res = await fetch("/api/stream/segments", { method: "POST", body: form });
  if (!res.ok) throw new Error(String(res.status));
  const { segment } = (await res.json()) as { segment: SegmentDTO };
  return segment;
}
