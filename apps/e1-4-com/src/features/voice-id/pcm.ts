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

/**
 * Sends a voice sample to be recognised. Signed out, a match opens that speaker's stream and a
 * new voice opens a new one; signed in, the sample refines the speaker's stored print.
 */
export async function sendVoice(blob: Blob): Promise<boolean> {
  const pcm = await blobToPcm16(blob);
  if (!pcm) return false;
  try {
    const res = await fetch("/api/voice-id", {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: pcm,
    });
    return res.ok;
  } catch {
    return false;
  }
}
