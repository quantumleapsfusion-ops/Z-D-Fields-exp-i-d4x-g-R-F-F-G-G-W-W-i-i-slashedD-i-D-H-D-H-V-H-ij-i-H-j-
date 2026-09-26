"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { SyncedTranscript } from "@/features/voice-stream/SyncedTranscript";
import { formatDuration } from "@/features/voice-stream/format";
import { segmentStarts, usePlayback, type AudioEngine } from "@/lib/audio/store";

/**
 * The one `<audio>` element in the app, pinned to the bottom of every page. Any surface can hand
 * it a playlist through `usePlayback().setPlaylist`; the dock plays the segments back to back
 * with one scrubber and a transcript that reveals in sync. Segment audio is fetched once and
 * cached as blob URLs (blob URLs seek reliably even for MediaRecorder WebM without a cue index).
 */
export function AudioDock() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const cache = useRef(new Map<string, string>());
  const wantPlay = useRef(false);
  const [expanded, setExpanded] = useState(true);

  const playlist = usePlayback((s) => s.playlist);
  const current = usePlayback((s) => s.current);
  const offsetMs = usePlayback((s) => s.offsetMs);
  const playing = usePlayback((s) => s.playing);
  const loading = usePlayback((s) => s.loading);
  const bindEngine = usePlayback((s) => s.bindEngine);
  const report = usePlayback((s) => s.report);
  const toggle = usePlayback((s) => s.toggle);
  const seekGlobal = usePlayback((s) => s.seekGlobal);
  const next = usePlayback((s) => s.next);
  const setPlaylist = usePlayback((s) => s.setPlaylist);

  const resolve = useCallback(async (segmentId: string) => {
    const list = usePlayback.getState().playlist;
    if (!list) throw new Error("No playlist");
    const cached = cache.current.get(segmentId);
    if (cached) return cached;
    const res = await fetch(list.audioUrl(segmentId));
    if (!res.ok) throw new Error(`Audio ${res.status}`);
    const url = URL.createObjectURL(await res.blob());
    cache.current.set(segmentId, url);
    return url;
  }, []);

  useEffect(() => {
    const engine: AudioEngine = {
      load: async (index, offset, autoplay) => {
        const el = audio.current;
        const segment = usePlayback.getState().playlist?.segments[index];
        if (!el || !segment) return;
        report({ loading: true });
        try {
          const url = await resolve(segment.id);
          if (el.src !== url) {
            el.src = url;
            await new Promise<void>((done) => {
              el.onloadedmetadata = () => done();
              el.onerror = () => done();
            });
          }
          el.currentTime = offset / 1000;
          report({ current: index, offsetMs: offset });
          wantPlay.current = autoplay;
          if (autoplay) await el.play();
        } finally {
          report({ loading: false });
        }
      },
      pause: () => {
        wantPlay.current = false;
        audio.current?.pause();
      },
      resume: async () => {
        const el = audio.current;
        if (!el || !el.src) throw new Error("Nothing loaded");
        wantPlay.current = true;
        await el.play();
      },
    };
    bindEngine(engine);
    return () => bindEngine(null);
  }, [bindEngine, report, resolve]);

  useEffect(() => {
    const urls = cache.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const onEnded = () => {
    if (!wantPlay.current || !next()) {
      wantPlay.current = false;
      report({ playing: false });
    }
  };

  const segments = playlist?.segments ?? [];
  const starts = segmentStarts(segments);
  const totalMs = segments.reduce((sum, s) => sum + s.durationMs, 0);
  const positionMs = (starts[current] ?? 0) + offsetMs;
  const segment = segments[current];

  return (
    <>
      <audio
        ref={audio}
        preload="auto"
        onPlay={() => report({ playing: true })}
        onPause={() => report({ playing: false })}
        onEnded={onEnded}
        onTimeUpdate={(e) => report({ offsetMs: e.currentTarget.currentTime * 1000 })}
      />
      <AnimatePresence>
        {playlist && segments.length > 0 ? (
          <motion.section
            key="dock"
            aria-label="Audio player"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:pl-[4.5rem]"
          >
            <div className="border-chalk/15 bg-blackboard/92 mx-auto max-w-3xl rounded-2xl border shadow-[0_-8px_40px_rgba(0,0,0,0.35)] backdrop-blur">
              <AnimatePresence initial={false}>
                {expanded && segment ? (
                  <motion.div
                    key="transcript"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-28 overflow-y-auto px-5 pt-4 pb-2">
                      <p className="label mb-2">
                        {playlist.title} · part {current + 1} of {segments.length}
                      </p>
                      <SyncedTranscript
                        text={segment.transcript}
                        positionMs={offsetMs}
                        durationMs={segment.durationMs}
                      />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="flex items-center gap-3 px-3 py-2">
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={playing ? "Pause" : "Play"}
                  className="bg-chalk text-blackboard flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90"
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
                <span className="text-dust w-14 shrink-0 text-right font-mono text-xs">
                  {formatDuration(positionMs)}
                </span>
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 right-0 left-0 flex items-center">
                    {segments.map((s, i) => (
                      <span
                        key={s.id}
                        className={`border-blackboard h-1 border-r ${
                          i === current ? "bg-ochre/70" : "bg-chalk/20"
                        }`}
                        style={{
                          width: `${totalMs ? (s.durationMs / totalMs) * 100 : 0}%`,
                        }}
                      />
                    ))}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(1, totalMs)}
                    step={100}
                    value={Math.min(positionMs, totalMs)}
                    aria-label="Scrub through the stream"
                    onChange={(e) => seekGlobal(Number(e.target.value))}
                    className="stream-scrubber relative w-full"
                  />
                </div>
                <span className="text-dust w-14 shrink-0 font-mono text-xs">
                  {loading ? "…" : formatDuration(totalMs)}
                </span>
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-label={expanded ? "Hide transcript" : "Show transcript"}
                  aria-pressed={expanded}
                  className="text-dust hover:text-chalk label px-1 transition-colors"
                >
                  Tx
                </button>
                <button
                  type="button"
                  onClick={() => setPlaylist(null)}
                  aria-label="Close player"
                  className="text-dust hover:text-chalk px-1 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path
                      d="M2 2l8 8M10 2l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </>
  );
}
