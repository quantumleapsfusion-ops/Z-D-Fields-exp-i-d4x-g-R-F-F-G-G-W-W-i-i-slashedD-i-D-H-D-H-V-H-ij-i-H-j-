"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { transcribeOnDevice } from "@/features/live/onDeviceWhisper";
import { useLiveTranscription } from "@/features/live/useLiveTranscription";
import { useCarry } from "@/lib/carry";
import type { SegmentDTO } from "@/lib/voice/stream";

import { useRecorder, type CapturedSpan } from "./useRecorder";

export type PendingSpan = { id: string; span: CapturedSpan; failed?: boolean };

const SPAN_GRACE_MS = 4000;

/**
 * Records into the user's stream and, once Stop has settled (every span uploaded, every
 * transcription finished), carries this session's words into `/journey`. Words come from the
 * server transcript, else the browser's live recognition, else Whisper run on the device. A
 * session that yields no words stays put and reports `silent`.
 */
export function useVoiceCapture(initialSegments: SegmentDTO[] = []) {
  const router = useRouter();
  const setCarryText = useCarry((state) => state.setText);
  const live = useLiveTranscription();
  const [segments, setSegments] = useState(initialSegments);
  const [pending, setPending] = useState<PendingSpan[]>([]);
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [awaitingSpan, setAwaitingSpan] = useState(false);
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [localText, setLocalText] = useState<string | null>(null);
  const localStarted = useRef(false);

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
      setSessionIds((prev) => [...prev, segment.id]);
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
    },
    [upload],
  );

  const recorder = useRecorder(onSpan);

  const heard =
    segments
      .filter((s) => sessionIds.includes(s.id))
      .map((s) => s.transcription?.trim())
      .filter((text): text is string => Boolean(text))
      .join(" ") || live.phrases.map((phrase) => phrase.text).join(" ");
  const spoken = heard || localText || "";

  const waiting = segments.some((s) => s.transcriptionStatus === "PENDING");
  const failedUploads = pending.some((p) => p.failed);
  const settled = finished && !awaitingSpan && pending.length === 0 && !waiting;
  const transcribing = settled && !heard && blobs.length > 0 && localText === null;
  const silent = settled && !spoken && !transcribing;

  const record = async () => {
    if (finished) {
      setSessionIds([]);
      setBlobs([]);
      setLocalText(null);
      localStarted.current = false;
      live.reset();
    }
    setFinished(false);
    await recorder.record();
    if (!live.listening) void live.start();
  };
  const pause = () => {
    recorder.pause();
    live.stop();
  };
  const finish = () => {
    if (live.interim) live.pushText(live.interim);
    setAwaitingSpan(recorder.state === "recording");
    recorder.stop();
    live.stop();
    setFinished(true);
  };
  const retryFailed = () => {
    const failed = pending.filter((p) => p.failed);
    setPending((prev) => prev.map((p) => (p.failed ? { ...p, failed: false } : p)));
    failed.forEach((p) => void upload({ ...p, failed: false }));
  };
  const carry = useCallback(
    (text: string) => {
      setCarryText(text);
      router.push("/journey");
    },
    [router, setCarryText],
  );

  useEffect(() => {
    if (!awaitingSpan) return;
    const timer = setTimeout(() => setAwaitingSpan(false), SPAN_GRACE_MS);
    return () => clearTimeout(timer);
  }, [awaitingSpan]);

  useEffect(() => {
    if (!settled || heard || !blobs.length || localStarted.current) return;
    localStarted.current = true;
    transcribeOnDevice(blobs)
      .then(setLocalText)
      .catch(() => setLocalText(""));
  }, [settled, heard, blobs]);

  useEffect(() => {
    if (settled && spoken) carry(spoken);
  }, [settled, spoken, carry]);

  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(async () => {
      const res = await fetch("/api/stream/segments", { cache: "no-store" });
      if (res.ok)
        setSegments(((await res.json()) as { segments: SegmentDTO[] }).segments);
    }, 2500);
    return () => clearInterval(timer);
  }, [waiting]);

  return {
    recorder,
    live,
    segments,
    setSegments,
    pending,
    failedUploads,
    carrying: finished && !silent && !failedUploads,
    silent,
    transcribing,
    record,
    pause,
    finish,
    retryFailed,
    carry,
  };
}
