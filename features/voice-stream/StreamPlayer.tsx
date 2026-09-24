'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { formatDuration } from './format';

export type PlayableSegment = { id: string; durationMs: number };

export type StreamPlayerHandle = { playFrom: (segmentId: string) => void };

/**
 * Plays a list of segments as one continuous stream: a single play/pause and a single scrubber
 * spanning the total duration. Segment audio is fetched once and cached as blob URLs (blob URLs
 * seek reliably even for MediaRecorder WebM files that have no cue index).
 */
export const StreamPlayer = forwardRef<
  StreamPlayerHandle,
  {
    segments: PlayableSegment[];
    audioUrl: (segmentId: string) => string;
    onActiveChange?: (segmentId: string | null) => void;
  }
>(function StreamPlayer({ segments, audioUrl, onActiveChange }, ref) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const cache = useRef(new Map<string, string>());
  const [current, setCurrent] = useState(0);
  const [offsetInSegment, setOffsetInSegment] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const wantPlay = useRef(false);

  const starts = useMemo(() => {
    let acc = 0;
    return segments.map((s) => {
      const start = acc;
      acc += s.durationMs;
      return start;
    });
  }, [segments]);
  const totalMs = segments.reduce((sum, s) => sum + s.durationMs, 0);
  const positionMs = (starts[current] ?? 0) + offsetInSegment;

  useEffect(() => {
    onActiveChange?.(playing ? (segments[current]?.id ?? null) : null);
  }, [current, playing, segments, onActiveChange]);

  useEffect(() => {
    const urls = cache.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const resolve = useCallback(
    async (segmentId: string) => {
      const cached = cache.current.get(segmentId);
      if (cached) return cached;
      const res = await fetch(audioUrl(segmentId));
      if (!res.ok) throw new Error(`Audio ${res.status}`);
      const url = URL.createObjectURL(await res.blob());
      cache.current.set(segmentId, url);
      return url;
    },
    [audioUrl],
  );

  const load = useCallback(
    async (index: number, offsetMs: number, autoplay: boolean) => {
      const el = audio.current;
      const segment = segments[index];
      if (!el || !segment) return;
      setLoading(true);
      try {
        const url = await resolve(segment.id);
        if (el.src !== url) {
          el.src = url;
          await new Promise<void>((done) => {
            el.onloadedmetadata = () => done();
            el.onerror = () => done();
          });
        }
        el.currentTime = offsetMs / 1000;
        setCurrent(index);
        setOffsetInSegment(offsetMs);
        wantPlay.current = autoplay;
        if (autoplay) await el.play();
      } finally {
        setLoading(false);
      }
    },
    [resolve, segments],
  );

  const seekGlobal = useCallback(
    (ms: number, autoplay: boolean) => {
      if (segments.length === 0) return;
      let index = starts.findIndex((start, i) => ms < start + segments[i].durationMs);
      if (index === -1) index = segments.length - 1;
      void load(index, Math.max(0, ms - starts[index]), autoplay);
    },
    [load, segments, starts],
  );

  useImperativeHandle(
    ref,
    () => ({
      playFrom: (segmentId: string) => {
        const index = segments.findIndex((s) => s.id === segmentId);
        if (index >= 0) void load(index, 0, true);
      },
    }),
    [load, segments],
  );

  const toggle = async () => {
    const el = audio.current;
    if (!el || segments.length === 0) return;
    if (playing) {
      wantPlay.current = false;
      el.pause();
      return;
    }
    if (!el.src) await load(current, offsetInSegment, true);
    else {
      wantPlay.current = true;
      await el.play();
    }
  };

  const onEnded = () => {
    const next = current + 1;
    if (next < segments.length && wantPlay.current) void load(next, 0, true);
    else {
      wantPlay.current = false;
      setPlaying(false);
    }
  };

  if (segments.length === 0) return null;

  return (
    <div className="flex items-center gap-4 rounded-full border border-chalk/15 bg-blackboard/90 px-4 py-2 backdrop-blur">
      <audio
        ref={audio}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={onEnded}
        onTimeUpdate={(e) => setOffsetInSegment(e.currentTarget.currentTime * 1000)}
      />
      <button
        type="button"
        onClick={() => void toggle()}
        aria-label={playing ? 'Pause stream' : 'Play stream'}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chalk text-blackboard transition-opacity hover:opacity-90"
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <rect x="1" y="1" width="3.5" height="10" fill="currentColor" />
            <rect x="7.5" y="1" width="3.5" height="10" fill="currentColor" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 1l9 5-9 5z" fill="currentColor" />
          </svg>
        )}
      </button>
      <span className="w-14 shrink-0 text-right font-mono text-xs text-dust">
        {formatDuration(positionMs)}
      </span>
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center">
          {segments.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 border-r border-blackboard ${i === current ? 'bg-ochre/70' : 'bg-chalk/20'}`}
              style={{ width: `${totalMs ? (s.durationMs / totalMs) * 100 : 0}%` }}
            />
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(1, totalMs)}
          step={100}
          value={Math.min(positionMs, totalMs)}
          aria-label="Scrub through your stream"
          onChange={(e) => seekGlobal(Number(e.target.value), playing)}
          className="stream-scrubber relative w-full"
        />
      </div>
      <span className="w-14 shrink-0 font-mono text-xs text-dust">
        {loading ? '…' : formatDuration(totalMs)}
      </span>
    </div>
  );
});
