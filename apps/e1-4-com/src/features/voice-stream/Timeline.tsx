"use client";

import type { SegmentDTO } from "@/lib/voice/stream";

import { formatDay, formatDuration, formatTime } from "./format";

export type TimelineItem =
  | { kind: "segment"; segment: SegmentDTO }
  | {
      kind: "uploading";
      id: string;
      startedAt: string;
      durationMs: number;
      failed?: boolean;
    };

function itemStart(item: TimelineItem) {
  return item.kind === "segment" ? item.segment.startedAt : item.startedAt;
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
      <span
        aria-hidden="true"
        className="bg-chalk/15 absolute top-2 bottom-0 left-[7px] w-px"
      />
      {groups.map((group) => (
        <li key={group.day} className="mb-10">
          <p className="label mb-4 pl-8">{group.day}</p>
          <ol className="space-y-4">
            {group.items.map((item) =>
              item.kind === "uploading" ? (
                <li key={item.id} className="relative pl-8">
                  <Dot active={false} pending />
                  <div className="border-chalk/15 text-dust rounded-sm border border-dashed px-5 py-4 text-sm">
                    {item.failed
                      ? "Upload failed — kept locally until you retry."
                      : "Saving…"}{" "}
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
      className={`absolute top-5 left-0 h-[15px] w-[15px] rounded-full border-2 ${
        active
          ? "border-ochre bg-ochre"
          : pending
            ? "border-dust bg-blackboard animate-pulse"
            : "border-chalk/50 bg-blackboard"
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
          active ? "border-ochre/50 bg-chalk/[0.04]" : "border-chalk/10"
        }`}
      >
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onPlay ? (
              <button
                type="button"
                onClick={() => onPlay(segment.id)}
                aria-label={`Play from ${formatTime(segment.startedAt)}`}
                className="border-chalk/25 text-chalk hover:border-ochre hover:text-ochre flex h-7 w-7 items-center justify-center rounded-full border transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 1l9 5-9 5z" fill="currentColor" />
                </svg>
              </button>
            ) : null}
            <span className="text-chalk font-sans text-sm">
              {formatTime(segment.startedAt)}
            </span>
            <span className="text-dust font-mono text-xs">
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
    case "DONE":
      return segment.transcription ? (
        <p className="font-display text-chalk/90 mt-3 text-lg leading-relaxed">
          {segment.transcription}
        </p>
      ) : (
        <p className="text-dust mt-3 text-sm italic">(silence)</p>
      );
    case "PENDING":
      return <p className="text-dust mt-3 animate-pulse text-sm">Transcribing…</p>;
    case "FAILED":
      return <p className="text-ochre/80 mt-3 text-sm">Transcription failed.</p>;
    case "SKIPPED":
      return (
        <p className="text-dust mt-3 text-sm">
          No speech-to-text provider configured — audio only.
        </p>
      );
  }
}
