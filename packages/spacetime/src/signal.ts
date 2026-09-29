/**
 * Voice amplitude fed in by the page that owns a live recording (0–1). The background only
 * reads this value; it never opens a microphone itself.
 */
let amplitude = 0;

export function setSpacetimeAmplitude(value: number) {
  amplitude = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

export function readSpacetimeAmplitude() {
  return amplitude;
}
