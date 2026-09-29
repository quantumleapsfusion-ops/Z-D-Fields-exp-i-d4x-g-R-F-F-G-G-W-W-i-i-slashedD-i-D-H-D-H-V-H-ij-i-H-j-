import type { Dimension } from "@/lib/site";

export type StageId =
  "voice" | "text" | "board" | "gravity" | "horizon" | "superposition" | "observed";

export type Stage = {
  id: StageId;
  dimension: Dimension | null;
  title: string;
  line: string;
};

/** The fixed order a stream travels in. Each stage hands its material to the next. */
export const STAGES: Stage[] = [
  {
    id: "voice",
    dimension: 1,
    title: "Voice Stream",
    line: "One line of sound.",
  },
  {
    id: "text",
    dimension: 1,
    title: "Speech to text",
    line: "The sound becomes words.",
  },
  {
    id: "board",
    dimension: 2,
    title: "Infinity Chalkboard",
    line: "The words spread across the board.",
  },
  {
    id: "gravity",
    dimension: 3,
    title: "Gravity Chalkboard",
    line: "Their weight bends the board into a well.",
  },
  {
    id: "horizon",
    dimension: 4,
    title: "Event Horizon",
    line: "Past this line nothing comes back out.",
  },
  {
    id: "superposition",
    dimension: 5,
    title: "Superposition",
    line: "Every reading at once, like the cat in the box.",
  },
  {
    id: "observed",
    dimension: 5,
    title: "Observed",
    line: "The box opens. One reading remains.",
  },
];

export const WORD_MS = 110;

/** How long a stage holds before the next one starts. `null` means it is the last stage. */
export function stageDuration(id: StageId, wordCount: number): number | null {
  switch (id) {
    case "voice":
      return 3500;
    case "text":
      return Math.min(12000, Math.max(4000, wordCount * WORD_MS + 1500));
    case "board":
      return 6500;
    case "gravity":
      return 7000;
    case "horizon":
      return 6500;
    case "superposition":
      return 8000;
    case "observed":
      return null;
  }
}

/** Index of the stage after `index`, or `index` itself once the journey has ended. */
export function nextStage(index: number): number {
  return Math.min(index + 1, STAGES.length - 1);
}
