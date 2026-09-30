import { describe, expect, it } from "vitest";

import { liveIdFor } from "./liveSpan";

describe("liveIdFor", () => {
  const sessions = [
    { liveId: "A", startedAt: 1000 },
    { liveId: null, startedAt: 5000 },
    { liveId: "B", startedAt: 9000 },
  ];

  it("keeps a stream's last clip on that stream even if it arrives after the next start", () => {
    expect(liveIdFor(new Date(4000), sessions)).toBe("A");
  });

  it("assigns notes and later streams by their own start", () => {
    expect(liveIdFor(new Date(5000), sessions)).toBeNull();
    expect(liveIdFor(new Date(9500), sessions)).toBe("B");
  });

  it("treats a span before any session as a plain note", () => {
    expect(liveIdFor(new Date(10), sessions)).toBeNull();
  });
});
