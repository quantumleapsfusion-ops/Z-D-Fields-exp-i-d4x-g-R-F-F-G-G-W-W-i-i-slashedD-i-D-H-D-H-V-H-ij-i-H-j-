import type { BoardElement } from "@/lib/chalkboard/types";

export type TranscribedSegment = {
  id: string;
  startedAt: string;
  transcription: string | null;
};

export function transcriptText(segments: TranscribedSegment[]): string {
  return segments
    .map((segment) => segment.transcription?.trim())
    .filter((text): text is string => Boolean(text))
    .join(" ");
}

export function transcriptElements(
  segments: TranscribedSegment[],
  color: string,
): BoardElement[] {
  return segments.flatMap((segment, index) => {
    const text = segment.transcription?.trim();
    if (!text) return [];
    return [
      {
        id: `stream-${segment.id}`,
        type: "text",
        color,
        createdAt: Date.parse(segment.startedAt),
        x: 0,
        y: index * 60,
        text,
        fontSize: 28,
        source: "voice",
      },
    ];
  });
}
