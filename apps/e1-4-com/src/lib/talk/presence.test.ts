import { describe, expect, it } from "vitest";

import {
  groupThread,
  isLive,
  LIVE_STALE_MS,
  mergeNotes,
  nextLivePart,
  pollCursor,
  reconcileNotes,
} from "./presence";

type N = {
  id: string;
  startedAt: string;
  createdAt: string;
  liveId: string | null;
  senderId: string;
  transcriptionStatus: string;
};

const at = (s: number) => new Date(Date.UTC(2026, 8, 29, 12, 0, s)).toISOString();
const note = (id: string, s: number, extra: Partial<N> = {}): N => ({
  id,
  startedAt: at(s),
  createdAt: at(s + 1),
  liveId: null,
  senderId: "a",
  transcriptionStatus: "DONE",
  ...extra,
});

describe("isLive", () => {
  it("is true only while the heartbeat is fresh", () => {
    const now = Date.parse(at(100));
    expect(isLive(null, now)).toBe(false);
    expect(isLive(at(99), now)).toBe(true);
    expect(isLive(new Date(now - LIVE_STALE_MS), now)).toBe(false);
  });
});

describe("mergeNotes", () => {
  it("dedupes by id, lets newer copies win, and sorts chronologically", () => {
    const merged = mergeNotes(
      [note("b", 5), note("a", 1, { transcriptionStatus: "PENDING" })],
      [note("a", 1), note("c", 3)],
    );
    expect(merged.map((n) => n.id)).toEqual(["a", "c", "b"]);
    expect(merged[0].transcriptionStatus).toBe("DONE");
  });
});

describe("reconcileNotes", () => {
  it("drops unsent notes but keeps ones created after the poll's snapshot", () => {
    const current = [note("gone", 1), note("kept", 2), note("justSent", 20)];
    const merged = reconcileNotes(current, [note("new", 5)], ["kept", "new"], at(15));
    expect(merged.map((n) => n.id)).toEqual(["kept", "new", "justSent"]);
  });
});

describe("pollCursor", () => {
  it("is null for an empty thread", () => {
    expect(pollCursor([])).toBeNull();
  });
  it("uses the newest note when nothing is pending", () => {
    expect(pollCursor([note("a", 1), note("b", 9), note("c", 4)])).toBe(at(10));
  });
  it("rewinds to the oldest pending transcript", () => {
    const notes = [
      note("a", 1),
      note("b", 5, { transcriptionStatus: "PENDING" }),
      note("c", 9, { transcriptionStatus: "PENDING" }),
    ];
    expect(pollCursor(notes)).toBe(at(6));
  });
});

describe("groupThread", () => {
  it("collapses a live stream's clips into one item at its first clip", () => {
    const items = groupThread([
      note("l2", 6, { liveId: "L" }),
      note("n1", 0),
      note("l1", 2, { liveId: "L" }),
      note("n2", 4, { senderId: "b" }),
      note("l3", 10, { liveId: "L" }),
    ]);
    expect(items.map((i) => (i.kind === "note" ? i.note.id : i.liveId))).toEqual([
      "n1",
      "L",
      "n2",
    ]);
    const live = items[1];
    expect(live.kind === "live" && live.parts.map((p) => p.id)).toEqual([
      "l1",
      "l2",
      "l3",
    ]);
  });
});

describe("nextLivePart", () => {
  const notes = [
    note("x", 0),
    note("l1", 1, { liveId: "L" }),
    note("l2", 5, { liveId: "L" }),
  ];
  it("starts at the first clip when nothing from this stream was heard", () => {
    expect(nextLivePart(notes, "L", null)?.id).toBe("l1");
    expect(nextLivePart(notes, "L", "x")?.id).toBe("l1");
  });
  it("advances clip by clip and returns null when caught up", () => {
    expect(nextLivePart(notes, "L", "l1")?.id).toBe("l2");
    expect(nextLivePart(notes, "L", "l2")).toBeNull();
  });
});
