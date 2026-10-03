import { WAVE_POINTS, type SoundPrint } from "@/lib/sound/analyse";

/** Loudness (0..1) of a recording at `progress` (0..1 through it), read from its waveform. */
export function levelAt(print: SoundPrint, progress: number): number {
  if (!(progress >= 0 && progress < 1)) return 0;
  const at = progress * (WAVE_POINTS - 1);
  const i = Math.floor(at);
  const a = print.waveform[i] ?? 0;
  const b = print.waveform[Math.min(WAVE_POINTS - 1, i + 1)] ?? a;
  return a + (b - a) * (at - i);
}

/**
 * Hears each new syllable in a level signal: the level has to fall below `fall` before another
 * rise past `rise` counts, and beats closer than `gapMs` are merged. Returns `true` on a beat.
 */
export function onsets({ rise = 0.45, fall = 0.25, gapMs = 180 } = {}) {
  let armed = true;
  let last = -Infinity;
  return (level: number, at: number): boolean => {
    if (level < fall) armed = true;
    if (!armed || level < rise || at - last < gapMs) return false;
    armed = false;
    last = at;
    return true;
  };
}
