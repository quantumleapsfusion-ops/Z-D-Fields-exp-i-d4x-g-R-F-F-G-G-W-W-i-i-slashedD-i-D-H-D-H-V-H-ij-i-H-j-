'use client';

import type { SegmentDTO } from '@/lib/voice/stream';

import { formatDay, formatDuration, formatTime } from './format';

export type TimelineItem =
  | { kind: 'segment'; segment: SegmentDTO }
  | { kind: 'uploading'; id: string; startedAt: string; durationMs: number; failed?: boolean };

function itemStart(item: TimelineItem) {
  return item.kind === 'segment' ? item.segment.startedAt : item.startedAt;
}

/**
 * Vertical, feed-style timeline of the single running stream — newest first, grouped by day.
 * Each card is a span of the same continuous recording, not a separate post.
 */
export function Timeline({
  items,
  activeId,
  onPlay,
  renderActions,
}: {
  items: TimelineItem[];
  activeId: string | null;
  onPlay?: (segmentId: string) => void;
  renderActions?: (segment: SegmentDTO) => React.ReactNode;
}) {
  const ordered = [...items].sort((a, b) => itemStart(b).localeCompare(itemStart(a)));
  const groups: { day: string; items: TimelineItem[] }[] = [];
  for (const item of ordered) {
    const day = formatDay(itemStart(item));
    const last = groups[groups.length - 1];
    if (last?.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }

  return (
    <ol className="relative">
      <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-2 w-px bg-chalk/15" />
      {groups.map((group) => (
        <li key={group.day} className="mb-10">
          <p className="label mb-4 pl-8">{group.day}</p>
          <ol className="space-y-4">
            {group.items.map((item) =>
              item.kind === 'uploading' ? (
                <li key={item.id} className="relative pl-8">
                  <Dot active={false} pending />
                  <div className="rounded-sm border border-dashed border-chalk/15 px-5 py-4 text-sm text-dust">
                    {item.failed ? 'Upload failed — kept locally until you retry.' : 'Saving…'}{' '}
                    {formatDuration(item.durationMs)}
                  </div>
                </li>
              ) : (
                <SegmentCard
                  key={item.segment.id}
                  segment={item.segment}
                  active={activeId === item.segment.id}
                  onPlay={onPlay}
                  actions={renderActions?.(item.segment)}
                />
              ),
            )}
          </ol>
        </li>
      ))}
    </ol>
  );
}

function Dot({ active, pending }: { active: boolean; pending?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute left-0 top-5 h-[15px] w-[15px] rounded-full border-2 ${
        active
          ? 'border-ochre bg-ochre'
          : pending
            ? 'animate-pulse border-dust bg-blackboard'
            : 'border-chalk/50 bg-blackboard'
      }`}
    />
  );
}

function SegmentCard({
  segment,
  active,
  onPlay,
  actions,
}: {
  segment: SegmentDTO;
  active: boolean;
  onPlay?: (segmentId: string) => void;
  actions?: React.ReactNode;
}) {
  return (
    <li className="relative pl-8">
      <Dot active={active} />
      <article
        className={`rounded-sm border px-5 py-4 transition-colors ${
          active ? 'border-ochre/50 bg-chalk/[0.04]' : 'border-chalk/10'
        }`}
      >
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onPlay ? (
              <button
                type="button"
                onClick={() => onPlay(segment.id)}
                aria-label={`Play from ${formatTime(segment.startedAt)}`}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-chalk/25 text-chalk transition-colors hover:border-ochre hover:text-ochre"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 1l9 5-9 5z" fill="currentColor" />
                </svg>
              </button>
            ) : null}
            <span className="font-sans text-sm text-chalk">{formatTime(segment.startedAt)}</span>
            <span className="font-mono text-xs text-dust">
              {formatDuration(segment.durationMs)}
            </span>
          </div>
          {actions ? <div className="flex items-center gap-4">{actions}</div> : null}
        </header>
        <Transcript segment={segment} />
      </article>
    </li>
  );
}

function Transcript({ segment }: { segment: SegmentDTO }) {
  switch (segment.transcriptionStatus) {
    case 'DONE':
      return segment.transcription ? (
        <p className="mt-3 font-display text-lg leading-relaxed text-chalk/90">
          {segment.transcription}
        </p>
      ) : (
        <p className="mt-3 text-sm italic text-dust">(silence)</p>
      );
    case 'PENDING':
      return <p className="mt-3 animate-pulse text-sm text-dust">Transcribing…</p>;
    case 'FAILED':
      return <p className="mt-3 text-sm text-ochre/80">Transcription failed.</p>;
    case 'SKIPPED':
      return (
        <p className="mt-3 text-sm text-dust">
          No speech-to-text provider configured — audio only.
        </p>
      );
  }
}
