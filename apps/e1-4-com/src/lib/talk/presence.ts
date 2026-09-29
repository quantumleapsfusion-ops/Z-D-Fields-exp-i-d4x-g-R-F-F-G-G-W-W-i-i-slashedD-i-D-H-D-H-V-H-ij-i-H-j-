/** A member counts as live while their last heartbeat (live start or uploaded part) is this fresh. */
export const LIVE_STALE_MS = 15_000;

/** While live, the recorder cuts a new independently playable clip this often. */
export const LIVE_PART_MS = 4_000;

export function isLive(
  liveAt: Date | string | null | undefined,
  now = Date.now(),
): boolean {
  if (!liveAt) return false;
  return now - new Date(liveAt).getTime() < LIVE_STALE_MS;
}

type Orderable = { id: string; startedAt: string };

/** Chronological order (oldest first); ties broken by id so the order is stable. */
export function byStartedAt<T extends Orderable>(a: T, b: T): number {
  return a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id);
}

/** Merges a poll result into the notes already on screen: newer copies win, order is chronological. */
export function mergeNotes<T extends Orderable>(current: T[], incoming: T[]): T[] {
  const byId = new Map(current.map((n) => [n.id, n]));
  for (const note of incoming) byId.set(note.id, note);
  return [...byId.values()].sort(byStartedAt);
}

/**
 * The `since` cursor for the next poll: the newest note we have, or earlier if an older note is
 * still waiting on its transcript (so the poll brings back its finished text).
 */
export function pollCursor(
  notes: { createdAt: string; transcriptionStatus: string }[],
): string | null {
  const pending = notes.filter((n) => n.transcriptionStatus === "PENDING");
  if (pending.length > 0) return pending.map((n) => n.createdAt).sort()[0];
  return (
    notes
      .map((n) => n.createdAt)
      .sort()
      .at(-1) ?? null
  );
}

export type ThreadItem<
  T extends Orderable & { liveId: string | null; senderId: string },
> =
  | { kind: "note"; note: T }
  | { kind: "live"; liveId: string; senderId: string; parts: T[] };

/** Groups consecutive clips of one live stream into a single item; everything else is a note. */
export function groupThread<
  T extends Orderable & { liveId: string | null; senderId: string },
>(notes: T[]): ThreadItem<T>[] {
  const items: ThreadItem<T>[] = [];
  const live = new Map<string, Extract<ThreadItem<T>, { kind: "live" }>>();
  for (const note of [...notes].sort(byStartedAt)) {
    if (!note.liveId) {
      items.push({ kind: "note", note });
      continue;
    }
    const existing = live.get(note.liveId);
    if (existing) existing.parts.push(note);
    else {
      const item = {
        kind: "live" as const,
        liveId: note.liveId,
        senderId: note.senderId,
        parts: [note],
      };
      live.set(note.liveId, item);
      items.push(item);
    }
  }
  return items;
}

/**
 * While following someone's live stream: the next clip of that stream to play after `lastHeardId`
 * (or the first clip if nothing was heard yet), or null when we're caught up.
 */
export function nextLivePart<T extends Orderable & { liveId: string | null }>(
  notes: T[],
  liveId: string,
  lastHeardId: string | null,
): T | null {
  const parts = notes.filter((n) => n.liveId === liveId).sort(byStartedAt);
  if (!lastHeardId) return parts[0] ?? null;
  const at = parts.findIndex((p) => p.id === lastHeardId);
  return at === -1 ? (parts[0] ?? null) : (parts[at + 1] ?? null);
}
