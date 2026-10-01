"use client";

import { getAudioContextCtor } from "@/features/voice-stream/audio-support";
import { VOICEPRINT_SAMPLE_RATE } from "@/lib/voiceprint/voiceprint";

const MAX_SECONDS = 12;

/** A recorded blob as mono 16 kHz 16-bit PCM, decoded and resampled on the device. */
export async function blobToPcm16(blob: Blob): Promise<ArrayBuffer | null> {
  const Ctor = getAudioContextCtor(window);
  if (!Ctor || typeof OfflineAudioContext === "undefined") return null;
  const context = new Ctor();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    const length = Math.min(
      Math.ceil(decoded.duration * VOICEPRINT_SAMPLE_RATE),
      MAX_SECONDS * VOICEPRINT_SAMPLE_RATE,
    );
    if (length <= 0) return null;
    const offline = new OfflineAudioContext(1, length, VOICEPRINT_SAMPLE_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const samples = (await offline.startRendering()).getChannelData(0);
    const out = new DataView(new ArrayBuffer(samples.length * 2));
    for (let i = 0; i < samples.length; i += 1) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      out.setInt16(i * 2, Math.round(s * 32767), true);
    }
    return out.buffer;
  } catch {
    return null;
  } finally {
    void context.close().catch(() => {});
  }
}

/** Why a sign-in did not go through; each has its own shake, glyph and vibration. */
export type VoiceRefusal = "voice" | "liveness" | "busy" | "setup";

export type VoiceResult = { ok: true } | { ok: false; reason: VoiceRefusal };

/**
 * Sends a voice sample to be recognised. Signed out, a match opens that speaker's stream and a
 * new voice opens a new one. `span.pcm` (tapped live from the microphone) is used when present;
 * decoding the recorded file is only the fallback. `challenge` is the liveness id whose digits the
 * person just spoke back.
 */
export async function sendVoice(
  span: { blob: Blob; pcm?: ArrayBuffer },
  challenge: string | null,
): Promise<VoiceResult> {
  const pcm = span.pcm ?? (await blobToPcm16(span.blob));
  if (!pcm) return { ok: false, reason: "voice" };
  const form = new FormData();
  form.append("voice", new Blob([pcm], { type: "application/octet-stream" }));
  form.append("audio", span.blob);
  if (challenge) form.append("challenge", challenge);
  try {
    const res = await fetch("/api/voice-id", { method: "POST", body: form });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as { reason?: VoiceRefusal } | null;
    return { ok: false, reason: body?.reason ?? (res.status >= 500 ? "setup" : "voice") };
  } catch {
    return { ok: false, reason: "setup" };
  }
}
