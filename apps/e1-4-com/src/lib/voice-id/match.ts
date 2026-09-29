/**
 * Collapses per-chunk similarity scores (`chunks[c][p]` = chunk c against profile p) into one
 * score per profile: the mean of each profile's best half of chunks, so pauses and breaths don't
 * drag a genuine speaker below the threshold.
 */
export function aggregateScores(chunks: number[][], profileCount: number): number[] {
  return Array.from({ length: profileCount }, (_, p) => {
    const scores = chunks.map((c) => c[p] ?? 0).sort((a, b) => b - a);
    const best = scores.slice(0, Math.max(1, Math.ceil(scores.length / 2)));
    return scores.length === 0 ? 0 : best.reduce((sum, s) => sum + s, 0) / best.length;
  });
}

export type SpeakerMatch = { userId: string; score: number };

/**
 * The enrolled speaker the voice belongs to, or null. The winner must clear `threshold` and beat
 * the runner-up by `margin`, so two similar voices never resolve to the wrong account.
 */
export function bestMatch(
  userIds: string[],
  scores: number[],
  threshold: number,
  margin = 0.1,
): SpeakerMatch | null {
  const ranked = userIds
    .map((userId, i) => ({ userId, score: scores[i] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const [first, second] = ranked;
  if (!first || first.score < threshold) return null;
  if (second && first.score - second.score < margin) return null;
  return first;
}
