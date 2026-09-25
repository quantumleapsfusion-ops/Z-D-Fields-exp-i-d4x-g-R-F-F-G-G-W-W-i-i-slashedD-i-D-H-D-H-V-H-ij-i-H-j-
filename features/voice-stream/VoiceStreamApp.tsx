'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import { deleteSegmentAction, deleteStreamAction } from '@/app/actions/stream';
import type { SegmentDTO } from '@/lib/voice/stream';

import { formatDuration } from './format';
import { ShareButton } from './ShareButton';
import { StreamPlayer, type StreamPlayerHandle } from './StreamPlayer';
import { Timeline, type TimelineItem } from './Timeline';
import { useRecorder, type CapturedSpan } from './useRecorder';

type Pending = { id: string; span: CapturedSpan; failed?: boolean };

const segmentAudioUrl = (id: string) => `/api/stream/segments/${id}/audio`;

export function VoiceStreamApp({ initialSegments }: { initialSegments: SegmentDTO[] }) {
  const [segments, setSegments] = useState(initialSegments);
  const [pending, setPending] = useState<Pending[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const player = useRef<StreamPlayerHandle>(null);

  const upload = useCallback(async (item: Pending) => {
    const form = new FormData();
    form.append('audio', item.span.blob);
    form.append('startedAt', item.span.startedAt.toISOString());
    form.append('endedAt', item.span.endedAt.toISOString());
    form.append('durationMs', String(Math.round(item.span.durationMs)));
    try {
      const res = await fetch('/api/stream/segments', { method: 'POST', body: form });
      if (!res.ok) throw new Error(String(res.status));
      const { segment } = (await res.json()) as { segment: SegmentDTO };
      setSegments((prev) => [...prev, segment].sort((a, b) => a.index - b.index));
      setPending((prev) => prev.filter((p) => p.id !== item.id));
    } catch {
      setPending((prev) => prev.map((p) => (p.id === item.id ? { ...p, failed: true } : p)));
    }
  }, []);

  const onSpan = useCallback(
    (span: CapturedSpan) => {
      const item = { id: crypto.randomUUID(), span };
      setPending((prev) => [...prev, item]);
      void upload(item);
    },
    [upload],
  );

  const recorder = useRecorder(onSpan);

  // Poll while any transcription is still running.
  const waiting = segments.some((s) => s.transcriptionStatus === 'PENDING');
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(async () => {
      const res = await fetch('/api/stream/segments', { cache: 'no-store' });
      if (res.ok) setSegments(((await res.json()) as { segments: SegmentDTO[] }).segments);
    }, 2500);
    return () => clearInterval(timer);
  }, [waiting]);

  const retryFailed = () => pending.filter((p) => p.failed).forEach((p) => void upload(p));

  const removeSegment = (id: string) => {
    if (
      !window.confirm('Permanently delete this part of your stream? Audio and text are destroyed.')
    ) {
      return;
    }
    startTransition(async () => {
      const { ok } = await deleteSegmentAction(id);
      if (ok) setSegments((prev) => prev.filter((s) => s.id !== id));
    });
  };

  const removeAll = () => {
    if (!window.confirm('Permanently delete your entire Voice Stream? This cannot be undone.'))
      return;
    startTransition(async () => {
      await deleteStreamAction();
      setSegments([]);
    });
  };

  const items: TimelineItem[] = [
    ...segments.map((segment) => ({ kind: 'segment' as const, segment })),
    ...pending.map((p) => ({
      kind: 'uploading' as const,
      id: p.id,
      startedAt: p.span.startedAt.toISOString(),
      durationMs: p.span.durationMs,
      failed: p.failed,
    })),
  ];
  const totalMs = segments.reduce((sum, s) => sum + s.durationMs, 0);

  return (
    <div>
      <RecorderPanel recorder={recorder} totalMs={totalMs} />

      {pending.some((p) => p.failed) ? (
        <button type="button" onClick={retryFailed} className="mt-4 text-sm text-ochre">
          Retry failed uploads
        </button>
      ) : null}

      <div className="sticky top-[4.25rem] z-10 mt-10">
        <StreamPlayer
          ref={player}
          segments={segments}
          audioUrl={segmentAudioUrl}
          onActiveChange={setActiveId}
        />
      </div>

      <div className="mt-10">
        {items.length === 0 ? (
          <p className="text-center font-display text-xl text-dust">
            Your stream is silent. Press record — it will keep running for as long as you do.
          </p>
        ) : (
          <Timeline
            items={items}
            activeId={activeId}
            onPlay={(id) => player.current?.playFrom(id)}
            renderActions={(segment) => (
              <>
                <ShareButton segmentId={segment.id} label="Share" />
                <button
                  type="button"
                  onClick={() => removeSegment(segment.id)}
                  className="text-sm text-dust transition-colors hover:text-ochre"
                >
                  Delete
                </button>
              </>
            )}
          />
        )}
      </div>

      {segments.length > 0 ? (
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-chalk/10 pt-6">
          <ShareButton segmentId={null} label="Share whole stream" />
          <button type="button" onClick={removeAll} className="text-sm text-dust hover:text-ochre">
            Delete entire stream
          </button>
        </div>
      ) : null}
    </div>
  );
}

function RecorderPanel({
  recorder,
  totalMs,
}: {
  recorder: ReturnType<typeof useRecorder>;
  totalMs: number;
}) {
  const { state, elapsedMs, level, error } = recorder;
  const bars = 28;

  return (
    <section className="rounded-sm border border-chalk/10 bg-chalk/[0.02] px-6 py-8">
      <div className="flex h-14 items-center justify-center gap-[3px]" aria-hidden="true">
        {Array.from({ length: bars }, (_, i) => {
          const wave = Math.sin((i / bars) * Math.PI);
          const h = state === 'recording' ? 8 + wave * level * 90 : 6;
          return (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-[height] duration-75 ${
                state === 'recording' ? 'bg-ochre' : 'bg-chalk/25'
              }`}
              style={{ height: `${Math.min(100, h)}%` }}
            />
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {state === 'idle' ? (
          <RoundButton onClick={() => void recorder.record()} primary label="Record" />
        ) : null}
        {state === 'recording' ? (
          <RoundButton onClick={recorder.pause} primary label="Pause" />
        ) : null}
        {state === 'paused' ? (
          <RoundButton onClick={() => void recorder.resume()} primary label="Resume" />
        ) : null}
        {state !== 'idle' ? <RoundButton onClick={recorder.stop} label="Stop" /> : null}
      </div>

      <p className="mt-4 text-center font-mono text-xs text-dust">
        {state === 'recording'
          ? `Recording · ${formatDuration(elapsedMs)}`
          : state === 'paused'
            ? 'Paused — resume on a whim'
            : `Stream length ${formatDuration(totalMs)}`}
      </p>
      {error ? <p className="mt-2 text-center text-sm text-ochre">{error}</p> : null}
    </section>
  );
}

function RoundButton({
  onClick,
  label,
  primary,
}: {
  onClick: () => void;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-12 min-w-28 rounded-full px-6 font-sans text-sm transition-colors ${
        primary
          ? 'bg-ochre font-medium text-blackboard hover:opacity-90'
          : 'border border-chalk/25 text-chalk hover:border-ochre hover:text-ochre'
      }`}
    >
      {label}
    </button>
  );
}
