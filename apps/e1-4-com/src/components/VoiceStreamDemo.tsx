import { Animated } from "@earth-one/ui";

import { Waveform } from "@/components/Waveform";

const TRANSCRIPT =
  "Somewhere between the second coffee and the train, the idea finally had a shape.";
const WORDS = TRANSCRIPT.split(" ");
/** Total loop length; every word is timed inside it so the line replays as a whole. */
const LOOP_MS = 9000;
const WORD_STEP_MS = 260;

/**
 * Purely decorative preview of a Voice Stream: pulsing REC dot, cyan waveform bars and a
 * transcript line that types itself in. CSS-only — it never touches the microphone.
 */
export function VoiceStreamDemo() {
  return (
    <Animated
      aria-hidden
      className="card pointer-events-none relative w-full max-w-xl p-6 select-none sm:p-8 lg:ml-auto"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-pulse-dot bg-accent absolute inline-flex h-full w-full rounded-full opacity-60" />
            <span className="bg-accent relative inline-flex h-3 w-3 rounded-full" />
          </span>
          <span className="label text-text-2">Rec · Voice Stream</span>
        </div>
        <span className="label">00:04:12</span>
      </div>

      <Waveform className="mt-10 h-16 sm:h-20" />

      <p
        className="font-display text-text mt-10 min-h-[4.5rem] text-lg leading-snug font-light sm:min-h-[5.25rem] sm:text-xl"
        style={{ ["--loop" as string]: `${LOOP_MS}ms` }}
      >
        {WORDS.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="animate-word inline-block"
            style={{ animationDelay: `${i * WORD_STEP_MS}ms` }}
          >
            {word}
            {i < WORDS.length - 1 ? "\u00a0" : ""}
          </span>
        ))}
      </p>

      <div className="hairline mt-8" />
      <div className="mt-5 flex items-center justify-between">
        <span className="label">Da Vinci · live transcript</span>
        <span className="label text-accent">Saving</span>
      </div>
    </Animated>
  );
}
