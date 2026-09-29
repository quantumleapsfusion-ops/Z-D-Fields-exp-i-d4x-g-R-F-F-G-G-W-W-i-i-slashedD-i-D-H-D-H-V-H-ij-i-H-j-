"use client";

import { getAudioContextCtor } from "@/features/voice-stream/audio-support";
import { type SoundPrint, analyseSound, concat, mixDown } from "@/lib/sound/analyse";

/** Decode recorded spans in the browser and measure them. Nothing leaves the device. */
export async function decodeSound(blobs: Blob[]): Promise<SoundPrint | null> {
  const Ctor = getAudioContextCtor(window);
  if (!Ctor || !blobs.length) return null;
  const context = new Ctor();
  try {
    const parts: Float32Array[] = [];
    for (const blob of blobs) {
      const decoded = await context
        .decodeAudioData(await blob.arrayBuffer())
        .catch(() => null);
      if (!decoded) continue;
      parts.push(
        mixDown(
          Array.from({ length: decoded.numberOfChannels }, (_, c) =>
            decoded.getChannelData(c),
          ),
        ),
      );
    }
    const samples = concat(parts);
    return samples.length ? analyseSound(samples, context.sampleRate) : null;
  } finally {
    void context.close().catch(() => {});
  }
}
