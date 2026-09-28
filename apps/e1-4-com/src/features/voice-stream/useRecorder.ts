"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  type AudioSupport,
  describeMicError,
  detectAudioSupport,
  detectPlatform,
  getAudioContextCtor,
  pickMimeType,
  resolveBlobType,
} from "./audio-support";

export type RecorderState = "idle" | "recording" | "paused";

export type CapturedSpan = {
  blob: Blob;
  mimeType: string;
  startedAt: Date;
  endedAt: Date;
  durationMs: number;
};

/** Safari's MP4 muxer produces broken files with very short timeslices; 1 s is safe everywhere. */
const TIMESLICE_MS = 1000;

const SERVER_SUPPORT: AudioSupport = { ok: true };
let clientSupport: AudioSupport | undefined;
const subscribeNever = () => () => {};
const getClientSupport = () => (clientSupport ??= detectAudioSupport(window));

/**
 * MediaRecorder wrapper. Each record/resume → pause/stop span becomes one `CapturedSpan`, which
 * the caller appends to the user's single running stream. Pausing keeps the microphone open so
 * resuming is instant; stopping releases it.
 *
 * Mobile constraints handled here:
 *  - iOS Safari: no WebM (falls back to audio/mp4), `recorder.mimeType` often empty,
 *    `webkitAudioContext` on older versions, capture is killed when the tab is backgrounded
 *    (we pause so the span so far is saved), `getUserMedia` must be called from a user gesture.
 *  - Android Chrome: permission prompt may be dismissed (NotAllowedError) or the mic may be
 *    held by another app (NotReadableError); the track can end mid-recording when another app
 *    grabs the mic (`track.onended`).
 *  - Both: in-app browsers / http:// origins expose no `mediaDevices` at all.
 */
export function useRecorder(onSpan: (span: CapturedSpan) => void) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const support = useSyncExternalStore(
    subscribeNever,
    getClientSupport,
    () => SERVER_SUPPORT,
  );

  const media = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const spanStart = useRef<{ wall: Date; perf: number } | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const raf = useRef<number | null>(null);
  const onSpanRef = useRef(onSpan);
  const platform = useRef(detectPlatform(undefined));

  useEffect(() => {
    onSpanRef.current = onSpan;
  }, [onSpan]);

  useEffect(() => {
    platform.current = detectPlatform(navigator.userAgent);
  }, []);

  const releaseMic = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    void audioCtx.current?.close().catch(() => {});
    audioCtx.current = null;
    media.current?.getTracks().forEach((t) => {
      t.onended = null;
      t.stop();
    });
    media.current = null;
    setLevel(0);
  }, []);

  const fail = useCallback(
    (err: unknown) => {
      setError(describeMicError(err, platform.current));
      if (recorder.current?.state === "recording") {
        try {
          recorder.current.stop();
        } catch {
          // Already stopped.
        }
      }
      recorder.current = null;
      releaseMic();
      setState("idle");
    },
    [releaseMic],
  );

  /** Level meter. Best-effort: a failure here must never block recording. */
  const meter = useCallback((stream: MediaStream) => {
    const Ctor = getAudioContextCtor(window);
    if (!Ctor) return;
    try {
      const ctx = new Ctor();
      // iOS creates contexts suspended until resumed inside a user gesture.
      if (ctx.state === "suspended") void ctx.resume().catch(() => {});
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
    } catch {
      // No meter; elapsed time is still updated by the recorder's ondataavailable below.
    }
  }, []);

  const beginSpan = useCallback(
    (stream: MediaStream) => {
      const requested = pickMimeType(MediaRecorder);
      let rec: MediaRecorder;
      try {
        rec = new MediaRecorder(stream, requested ? { mimeType: requested } : undefined);
      } catch (err) {
        // Safari may reject a type its own isTypeSupported accepted; let it choose.
        if (!requested) throw err;
        rec = new MediaRecorder(stream);
      }
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
        if (!audioCtx.current && spanStart.current)
          setElapsedMs(performance.now() - spanStart.current.perf);
      };
      rec.onerror = (event) => {
        const detail = (event as Event & { error?: unknown }).error;
        fail(detail ?? new DOMException("Recording failed", "UnknownError"));
      };
      rec.onstop = () => {
        const start = spanStart.current;
        spanStart.current = null;
        if (!start || chunks.current.length === 0) return;
        const type = resolveBlobType({
          recorderMimeType: rec.mimeType,
          requestedMimeType: requested,
          firstChunkType: chunks.current[0]?.type,
          platform: platform.current,
        });
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
      rec.start(TIMESLICE_MS);
      recorder.current = rec;
      setElapsedMs(0);
    },
    [fail],
  );

  const record = useCallback(async () => {
    setError(null);
    const check = detectAudioSupport(window);
    if (!check.ok) {
      setError(check.message);
      return;
    }
    try {
      if (!media.current) {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
          });
        } catch (err) {
          const name = err instanceof Error ? err.name : "";
          if (name !== "OverconstrainedError" && name !== "ConstraintNotSatisfiedError")
            throw err;
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        media.current = stream;
        stream.getAudioTracks().forEach((track) => {
          track.onended = () =>
            fail(new DOMException("Microphone disconnected", "AbortError"));
        });
        meter(stream);
      }
      beginSpan(media.current);
      setState("recording");
    } catch (err) {
      fail(err);
    }
  }, [beginSpan, fail, meter]);

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

  // Mobile browsers suspend capture (and Safari discards buffered data) when the
  // tab is hidden or the phone locks. Flush the span so far rather than lose it.
  useEffect(() => {
    if (state !== "recording") return;
    const onHide = () => {
      if (document.visibilityState === "hidden") pause();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", pause);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", pause);
    };
  }, [state, pause]);

  useEffect(
    () => () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
      releaseMic();
    },
    [releaseMic],
  );

  return {
    state,
    elapsedMs,
    level,
    /** Capture error, or the reason this browser cannot record at all. */
    error: error ?? (support.ok ? null : support.message),
    /** `false` when this browser cannot record at all; the UI disables Record. */
    supported: support.ok,
    record,
    pause,
    resume: record,
    stop,
  };
}
