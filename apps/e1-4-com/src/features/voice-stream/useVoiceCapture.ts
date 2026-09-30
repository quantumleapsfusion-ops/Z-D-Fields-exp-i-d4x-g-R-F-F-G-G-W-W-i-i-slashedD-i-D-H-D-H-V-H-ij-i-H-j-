"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { decodeSound } from "@/features/sound/decode";
import { sendVoice } from "@/features/voice-id/pcm";
import { useCarry } from "@/lib/carry";
import type { SoundPrint } from "@/lib/sound/analyse";
import type { SegmentDTO } from "@/lib/voice/stream";

import { useRecorder, type CapturedSpan } from "./useRecorder";

export type PendingSpan = { id: string; span: CapturedSpan; failed?: boolean };

const SPAN_GRACE_MS = 4000;
const VOICE_SAMPLE_MIN_MS = 1500;

/**
 * Records into the user's stream and, once Stop has settled (every span uploaded), measures this
 * session's sound on the device and carries it into `/journey`. A session with no sound in it
 * stays put and reports `silent`.
 */
export function useVoiceCapture(initialSegments: SegmentDTO[] = []) {
  const router = useRouter();
  const setSound = useCarry((state) => state.setSound);
  const [segments, setSegments] = useState(initialSegments);
  const [pending, setPending] = useState<PendingSpan[]>([]);
  const [finished, setFinished] = useState(false);
  const [awaitingSpan, setAwaitingSpan] = useState(false);
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [print, setPrint] = useState<SoundPrint | null | undefined>(undefined);
  const analysed = useRef(false);

  const upload = useCallback(async (item: PendingSpan) => {
    const form = new FormData();
    form.append("audio", item.span.blob);
    form.append("startedAt", item.span.startedAt.toISOString());
    form.append("endedAt", item.span.endedAt.toISOString());
    form.append("durationMs", String(Math.round(item.span.durationMs)));
    try {
      const res = await fetch("/api/stream/segments", { method: "POST", body: form });
      if (!res.ok) throw new Error(String(res.status));
      const { segment } = (await res.json()) as { segment: SegmentDTO };
      setSegments((prev) => [...prev, segment].sort((a, b) => a.index - b.index));
      setPending((prev) => prev.filter((p) => p.id !== item.id));
    } catch {
      setPending((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, failed: true } : p)),
      );
    }
  }, []);

  const onSpan = useCallback(
    (span: CapturedSpan) => {
      const item = { id: crypto.randomUUID(), span };
      setAwaitingSpan(false);
      setBlobs((prev) => [...prev, span.blob]);
      setPending((prev) => [...prev, item]);
      void upload(item);
      if (span.durationMs >= VOICE_SAMPLE_MIN_MS) void sendVoice(span.blob);
    },
    [upload],
  );

  const recorder = useRecorder(onSpan);

  const failedUploads = pending.some((p) => p.failed);
  const settled = finished && !awaitingSpan && pending.length === 0;
  const analysing = settled && print === undefined;
  const heard = Boolean(print && print.voicedRatio > 0);
  const silent = settled && print !== undefined && !heard;

  const record = async () => {
    if (finished) {
      setBlobs([]);
      setPrint(undefined);
      analysed.current = false;
    }
    setFinished(false);
    await recorder.record();
  };
  const pause = () => recorder.pause();
  const finish = () => {
    setAwaitingSpan(recorder.state === "recording");
    recorder.stop();
    setFinished(true);
  };
  const retryFailed = () => {
    const failed = pending.filter((p) => p.failed);
    setPending((prev) => prev.map((p) => (p.failed ? { ...p, failed: false } : p)));
    failed.forEach((p) => void upload({ ...p, failed: false }));
  };

  useEffect(() => {
    if (!awaitingSpan) return;
    const timer = setTimeout(() => setAwaitingSpan(false), SPAN_GRACE_MS);
    return () => clearTimeout(timer);
  }, [awaitingSpan]);

  useEffect(() => {
    if (!settled || analysed.current) return;
    analysed.current = true;
    decodeSound(blobs)
      .then(setPrint)
      .catch(() => setPrint(null));
  }, [settled, blobs]);

  useEffect(() => {
    if (!settled || !print || !heard) return;
    setSound(print);
    router.push("/journey");
  }, [settled, print, heard, setSound, router]);

  return {
    recorder,
    segments,
    setSegments,
    pending,
    failedUploads,
    carrying: finished && !silent && !failedUploads,
    analysing,
    silent,
    record,
    pause,
    finish,
    retryFailed,
  };
}
