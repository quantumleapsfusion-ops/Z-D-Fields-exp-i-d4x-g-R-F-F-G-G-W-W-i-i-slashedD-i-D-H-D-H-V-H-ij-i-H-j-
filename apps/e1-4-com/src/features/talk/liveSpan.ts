/** One press of record: a live stream (with its id) or a plain voice note (`null`). */
export type RecordingSession = { liveId: string | null; startedAt: number };

/**
 * The live stream a captured span belongs to, decided by when the span *began*: the session
 * started most recently at or before it. `MediaRecorder.onstop` fires late, so reading the
 * current mode then could hand a stream's last clip to the next note or stream.
 */
export function liveIdFor(
  spanStartedAt: Date,
  sessions: RecordingSession[],
): string | null {
  const at = spanStartedAt.getTime();
  let owner: RecordingSession | undefined;
  for (const s of sessions) {
    if (s.startedAt <= at && (!owner || s.startedAt >= owner.startedAt)) owner = s;
  }
  return owner?.liveId ?? null;
}
