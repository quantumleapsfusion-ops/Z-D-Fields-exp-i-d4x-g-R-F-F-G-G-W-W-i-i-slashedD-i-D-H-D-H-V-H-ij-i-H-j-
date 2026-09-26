"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "recording" | "paused";

export type CapturedSpan = {
  blob: Blob;
  mimeType: string;
  startedAt: Date;
  endedAt: Date;
  durationMs: number;
};

const PREFERRED_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
];

function pickMimeType(): string | undefined {
  return PREFERRED_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
}

/**
 * MediaRecorder wrapper. Each record/resume → pause/stop span becomes one `CapturedSpan`, which
 * the caller appends to the user's single running stream. Pausing keeps the microphone open so
 * resuming is instant; stopping releases it.
 */
export function useRecorder(onSpan: (span: CapturedSpan) => void) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const media = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const spanStart = useRef<{ wall: Date; perf: number } | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const raf = useRef<number | null>(null);
  const onSpanRef = useRef(onSpan);

  useEffect(() => {
    onSpanRef.current = onSpan;
  }, [onSpan]);

  const meter = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (const v of data) peak = Math.max(peak, Math.abs(v - 128) / 128);
      setLevel(peak);
      if (spanStart.current) setElapsedMs(performance.now() - spanStart.current.perf);
      raf.current = requestAnimationFrame(tick);
    };
    tick();
    audioCtx.current = ctx;
  }, []);

  const beginSpan = useCallback((stream: MediaStream) => {
    const mimeType = pickMimeType();
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunks.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };
    rec.onstop = () => {
      const start = spanStart.current;
      spanStart.current = null;
      if (!start || chunks.current.length === 0) return;
      const type = rec.mimeType || mimeType || "audio/webm";
      const endedAt = new Date();
      onSpanRef.current({
        blob: new Blob(chunks.current, { type }),
        mimeType: type,
        startedAt: start.wall,
        endedAt,
        durationMs: performance.now() - start.perf,
      });
    };
    spanStart.current = { wall: new Date(), perf: performance.now() };
    rec.start(1000);
    recorder.current = rec;
    setElapsedMs(0);
  }, []);

  const releaseMic = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    void audioCtx.current?.close();
    audioCtx.current = null;
    media.current?.getTracks().forEach((t) => t.stop());
    media.current = null;
    setLevel(0);
  }, []);

  const record = useCallback(async () => {
    setError(null);
    try {
      if (!media.current) {
        media.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        meter(media.current);
      }
      beginSpan(media.current);
      setState("recording");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone unavailable");
      releaseMic();
      setState("idle");
    }
  }, [beginSpan, meter, releaseMic]);

  const pause = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
    setState("paused");
  }, []);

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
    recorder.current = null;
    releaseMic();
    setState("idle");
  }, [releaseMic]);

  useEffect(
    () => () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
      releaseMic();
    },
    [releaseMic],
  );

  return { state, elapsedMs, level, error, record, pause, resume: record, stop };
}
