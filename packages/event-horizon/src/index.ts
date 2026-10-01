/**
 * e1-4 4D: the Event Horizon.
 *
 * Phrase density over a stream: as the same words return, a reading gathers weight until it
 * passes the horizon and cannot come back. The working view is `apps/e1-4-com/src/features/horizon`
 * and the density function sits in `src/lib/gravity/superposition.ts`; this package names the
 * contract. No code runs here.
 */

/** Density at or above this is past the horizon. */
export const EVENT_HORIZON = 0.7;

/** A measured phrase. */
export interface Phrase {
  text: string;
  count: number;
  /** When it was first and last heard, Unix milliseconds. */
  firstAt: number;
  lastAt: number;
}

/** One sample of a stream's weight at a moment. */
export interface DensitySample {
  at: number;
  /** 0 to 1: how much of what was said is repetition of what was already said. */
  density: number;
  /** Phrases carrying the weight at that moment, heaviest first. */
  phrases: Phrase[];
}

/** The whole picture for one stream: what passed the horizon, and when. */
export interface Horizon {
  samples: DensitySample[];
  crossedAt: number | null;
}

/** Measures a stream. Pure text in, numbers out, so it is testable without a database. */
export interface DensityMeter {
  measure(transcripts: { text: string; at: number }[]): Horizon;
}
