"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import type { PinPhase } from "@/features/codex/PinField";
import { pinsFor } from "@/features/codex/stages";
import { decodeSound } from "@/features/sound/decode";
import { usePlayback } from "@/lib/audio/store";
import type { Form } from "@/lib/gravity/superposition";
import { STAGES } from "@/lib/journey";
import type { SoundPrint } from "@/lib/sound/analyse";
import { readSound } from "@/lib/sound/reading";
import type { NoteDTO } from "@/lib/talk/conversations";
import { talkStageAt } from "@/lib/talk/dimensions";

const PinField = dynamic(() => import("@/features/codex/PinField"), { ssr: false });

const CYCLE_MS = 1400;

/**
 * The conversation's spacetime: the note being heard climbs from a 1D line through the board,
 * gravity and the event horizon into superposition while it plays, then stays observed until the
 * next one. Recording ripples the field with the speaker's level. Measured from the audio itself on
 * the device; no words are shown.
 */
export function TalkField({
  note,
  playing,
  recording,
  level,
  audioUrl,
}: {
  note: NoteDTO | null;
  playing: boolean;
  recording: boolean;
  level: number;
  audioUrl: (noteId: string) => string;
}) {
  const offsetMs = usePlayback((s) => s.offsetMs);
  const [prints, setPrints] = useState<ReadonlyMap<string, SoundPrint | null>>(
    () => new Map(),
  );
  const [cycle, setCycle] = useState(0);

  const noteId = note?.id ?? null;
  useEffect(() => {
    if (!noteId || prints.has(noteId)) return;
    let cancelled = false;
    void fetch(audioUrl(noteId))
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => (blob ? decodeSound([blob]) : null))
      .catch(() => null)
      .then((print) => {
        if (!cancelled) setPrints((prev) => new Map(prev).set(noteId, print));
      });
    return () => {
      cancelled = true;
    };
  }, [noteId, prints, audioUrl]);

  const print = noteId ? (prints.get(noteId) ?? null) : null;
  const reading = useMemo(() => (print ? readSound(print) : null), [print]);
  const stage = note && playing ? talkStageAt(offsetMs, note.durationMs) : "observed";

  useEffect(() => {
    if (stage !== "superposition") return;
    const timer = setInterval(() => setCycle((current) => current + 1), CYCLE_MS);
    return () => clearInterval(timer);
  }, [stage]);

  let phase: PinPhase = "rest";
  let form: Form = "sphere";
  if (recording) phase = "listen";
  else if (reading) {
    [phase, form] = pinsFor(
      stage,
      reading.candidates[cycle % reading.candidates.length].form,
      reading.candidates[reading.resolvedIndex].form,
    );
  }

  return (
    <div className="relative h-[46vh] min-h-72 w-full">
      <PinField
        phase={phase}
        level={recording ? level : 0}
        print={print}
        form={form}
        pulse={STAGES.findIndex((s) => s.id === stage)}
      />
    </div>
  );
}
