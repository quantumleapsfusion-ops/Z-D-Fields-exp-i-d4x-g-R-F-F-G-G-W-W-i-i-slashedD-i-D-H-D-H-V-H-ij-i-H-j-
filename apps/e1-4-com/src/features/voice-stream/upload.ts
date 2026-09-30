"use client";

import { blobToPcm16 } from "@/features/voice-id/pcm";
import type { SegmentDTO } from "@/lib/voice/stream";

import type { CapturedSpan } from "./useRecorder";

/** Shortest span worth checking against the speaker's voiceprint. */
const VOICE_SAMPLE_MIN_MS = 1500;
/** Waits before each further upload attempt; a phone on a flaky connection gets three tries. */
const RETRY_DELAYS_MS = [1000, 3000];

async function postWithRetry(form: FormData): Promise<Response> {
  for (let attempt = 0; ; attempt += 1) {
    const res = await fetch("/api/stream/segments", { method: "POST", body: form }).catch(
      () => null,
    );
    if (res?.ok) return res;
    const retryable = !res || res.status >= 500 || res.status === 429;
    const wait = RETRY_DELAYS_MS[attempt];
    if (!retryable || wait === undefined)
      throw new Error(String(res?.status ?? "network"));
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}

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
  const res = await postWithRetry(form);
  const { segment } = (await res.json()) as { segment: SegmentDTO };
  return segment;
}
