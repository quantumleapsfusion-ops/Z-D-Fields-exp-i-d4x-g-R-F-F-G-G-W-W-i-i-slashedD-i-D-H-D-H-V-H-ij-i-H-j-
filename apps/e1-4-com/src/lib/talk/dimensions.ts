import { STAGES, type StageId, stageDuration } from "@/lib/journey";

/** Shortest time a note spends in any one dimension, so short notes still climb visibly. */
export const MIN_STAGE_MS = 900;

const TIMED = STAGES.filter((stage) => stageDuration(stage.id) !== null);
const WEIGHT = TIMED.reduce((sum, stage) => sum + (stageDuration(stage.id) ?? 0), 0);

/**
 * Which dimension a voice note is in `elapsedMs` into playback. The journey's stages are spread
 * across the note in proportion to their journey timings; once the note has played through, it is
 * observed.
 */
export function talkStageAt(elapsedMs: number, durationMs: number): StageId {
  const total = Math.max(durationMs, MIN_STAGE_MS * TIMED.length);
  let edge = 0;
  for (const stage of TIMED) {
    edge += ((stageDuration(stage.id) ?? 0) / WEIGHT) * total;
    if (elapsedMs < edge) return stage.id;
  }
  return "observed";
}
