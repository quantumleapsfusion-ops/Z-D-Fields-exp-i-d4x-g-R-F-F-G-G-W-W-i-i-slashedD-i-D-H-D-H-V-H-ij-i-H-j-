import type { Dimension } from "@/lib/site";

export type StageId =
  "voice" | "board" | "gravity" | "horizon" | "superposition" | "observed";

export type Stage = {
  id: StageId;
  dimension: Dimension | null;
  title: string;
  line: string;
};

/** The fixed order a stream travels in. Each stage hands its sound to the next. */
export const STAGES: Stage[] = [
  {
    id: "voice",
    dimension: 1,
    title: "Voice Stream",
    line: "One line of sound, left to right.",
  },
  {
    id: "board",
    dimension: 2,
    title: "Infinity Chalkboard",
    line: "The sound spreads across the board: time runs across, pitch climbs up.",
  },
  {
    id: "gravity",
    dimension: 3,
    title: "Gravity Chalkboard",
    line: "Loudness lifts the board into hills.",
  },
  {
    id: "horizon",
    dimension: 4,
    title: "Event Horizon",
    line: "The weight folds it into a well. Past this line nothing comes back out.",
  },
  {
    id: "superposition",
    dimension: 5,
    title: "Superposition",
    line: "Every shape the sound could be, at once, like the cat in the box.",
  },
  {
    id: "observed",
    dimension: 5,
    title: "Observed",
    line: "The box opens. One shape remains.",
  },
];

/** How long a stage holds before the next one starts. `null` means it is the last stage. */
export function stageDuration(id: StageId): number | null {
  switch (id) {
    case "voice":
      return 5000;
    case "board":
      return 7000;
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
