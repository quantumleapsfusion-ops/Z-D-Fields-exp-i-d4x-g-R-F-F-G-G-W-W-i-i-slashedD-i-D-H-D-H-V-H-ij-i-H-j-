import { VOICEPRINT_SAMPLE_RATE } from "@/lib/voiceprint/voiceprint";

/** Longest stretch kept for identifying a speaker. */
export const MAX_PCM_SECONDS = 12;

/**
 * Raw microphone chunks (any sample rate) as mono 16 kHz 16-bit little-endian PCM, the form the
 * server measures a voiceprint from. Linear resampling is plenty for speaker features.
 */
export function toPcm16(chunks: Float32Array[], sampleRate: number): ArrayBuffer | null {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  if (total === 0 || sampleRate <= 0) return null;
  const source = new Float32Array(total);
  let at = 0;
  for (const chunk of chunks) {
    source.set(chunk, at);
    at += chunk.length;
  }
  const step = sampleRate / VOICEPRINT_SAMPLE_RATE;
  const length = Math.min(
    Math.floor(total / step),
    MAX_PCM_SECONDS * VOICEPRINT_SAMPLE_RATE,
  );
  if (length <= 0) return null;
  const out = new DataView(new ArrayBuffer(length * 2));
  for (let i = 0; i < length; i += 1) {
    const position = i * step;
    const index = Math.floor(position);
    const frac = position - index;
    const a = source[index];
    const b = source[Math.min(index + 1, total - 1)];
    const sample = Math.max(-1, Math.min(1, a + (b - a) * frac));
    out.setInt16(i * 2, Math.round(sample * 32767), true);
  }
  return out.buffer;
}
