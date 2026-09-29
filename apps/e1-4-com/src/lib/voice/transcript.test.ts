import { describe, expect, it } from "vitest";

import { transcriptElements, transcriptText } from "./transcript";

const segments = [
  {
    id: "first",
    startedAt: "2025-01-01T00:00:00.000Z",
    transcription: "  First thought. ",
  },
  {
    id: "empty",
    startedAt: "2025-01-01T00:01:00.000Z",
    transcription: " ",
  },
  {
    id: "third",
    startedAt: "2025-01-01T00:02:00.000Z",
    transcription: "Third thought.",
  },
  { id: "missing", startedAt: "2025-01-01T00:03:00.000Z", transcription: null },
];

describe("stream transcript helpers", () => {
  it("joins trimmed non-empty transcriptions", () => {
    expect(transcriptText(segments)).toBe("First thought. Third thought.");
  });

  it("creates ordered chalkboard text elements with segment timestamps", () => {
    expect(transcriptElements(segments, "#fff")).toEqual([
      {
        id: "stream-first",
        type: "text",
        color: "#fff",
        createdAt: Date.parse(segments[0].startedAt),
        x: 0,
        y: 0,
        text: "First thought.",
        fontSize: 28,
        source: "voice",
      },
      {
        id: "stream-third",
        type: "text",
        color: "#fff",
        createdAt: Date.parse(segments[2].startedAt),
        x: 0,
        y: 120,
        text: "Third thought.",
        fontSize: 28,
        source: "voice",
      },
    ]);
  });
});
