import type { StageId } from "@/lib/journey";

import type { SoundPrint } from "./analyse";
import { readSound } from "./reading";

/** The few measurements of an entry worth remembering to compare the next one against. */
export type EntrySummary = {
  durationMs: number;
  meanPitchHz: number | null;
  centroidHz: number;
  voicedRatio: number;
};

export function summarise(print: SoundPrint): EntrySummary {
  return {
    durationMs: print.durationMs,
    meanPitchHz: print.meanPitchHz,
    centroidHz: print.centroidHz,
    voicedRatio: print.voicedRatio,
  };
}

function register(hz: number): string {
  if (hz < 140) return "a low register";
  if (hz < 260) return "a middle register";
  return "a high register";
}

/** What the Codex says back about an entry, sentence by sentence, from its measurements alone. */
export function commentOn(print: SoundPrint, previous?: EntrySummary | null): string[] {
  const seconds = print.durationMs / 1000;
  const lines = [
    `I heard ${seconds.toFixed(1)} seconds from you. Sound filled ${Math.round(print.voicedRatio * 100)} percent of it.`,
  ];
  if (print.meanPitchHz) {
    lines.push(
      `Your voice centred on ${Math.round(print.meanPitchHz)} hertz, in ${register(print.meanPitchHz)}.`,
    );
  }
  const { candidates, resolvedIndex } = readSound(print);
  const strongest = candidates[resolvedIndex];
  lines.push(
    `Its strongest shape is ${strongest.title.toLowerCase()}. ${strongest.interpretation}`,
  );

  if (previous) {
    if (print.meanPitchHz && previous.meanPitchHz) {
      const shift = 12 * Math.log2(print.meanPitchHz / previous.meanPitchHz);
      if (Math.abs(shift) >= 1) {
        lines.push(
          `That is ${Math.abs(shift).toFixed(1)} semitones ${shift > 0 ? "higher" : "lower"} than your last entry.`,
        );
      } else {
        lines.push("You are speaking at the same pitch as last time.");
      }
    }
    const ratio = print.durationMs / Math.max(1, previous.durationMs);
    if (ratio >= 1.5) lines.push("You spoke longer than last time.");
    else if (ratio <= 0.67) lines.push("You spoke for less time than last time.");
  }
  lines.push("The original is kept in your stream.");
  return lines;
}

/** What Da Vinci says as the sound enters each dimension. */
export function narrate(
  stage: StageId,
  print: SoundPrint,
  previous?: EntrySummary | null,
): string[] {
  switch (stage) {
    case "voice":
      return [
        `This is your voice as one line of sound, ${(print.durationMs / 1000).toFixed(1)} seconds long.`,
      ];
    case "board":
      return ["Now it spreads across the board. Time runs across. Pitch climbs upward."];
    case "gravity":
      return ["Loudness gives it weight, and the board lifts into hills."];
    case "horizon":
      return [
        "The weight pulls everything into a well. Past the horizon, nothing comes back.",
      ];
    case "superposition":
      return ["Until it is observed, it is every shape at once."];
    case "observed":
      return commentOn(print, previous);
  }
}
