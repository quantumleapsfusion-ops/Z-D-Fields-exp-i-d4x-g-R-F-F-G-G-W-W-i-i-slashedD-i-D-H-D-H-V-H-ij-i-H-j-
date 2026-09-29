"use client";

import { useMemo, useTransition } from "react";

import { CodexReplay } from "@/features/codex/CodexReplay";
import { deleteSegmentAction, deleteStreamAction } from "@/app/actions/stream";
import type { Playlist } from "@/lib/audio/store";
import { usePlaylist } from "@/lib/audio/usePlaylist";
import type { SegmentDTO } from "@/lib/voice/stream";

import { formatDuration } from "./format";
import { ShareButton } from "./ShareButton";
import { Timeline, type TimelineItem } from "./Timeline";
import type { useRecorder } from "./useRecorder";
import { useVoiceCapture } from "./useVoiceCapture";

const segmentAudioUrl = (id: string) => `/api/stream/segments/${id}/audio`;

export function VoiceStreamApp({ initialSegments }: { initialSegments: SegmentDTO[] }) {
  const {
    recorder,
    segments,
    setSegments,
    pending,
    failedUploads,
    carrying,
    silent,
    record,
    pause,
    finish,
    retryFailed,
  } = useVoiceCapture(initialSegments);
  const [, startTransition] = useTransition();
  const playlist = useMemo<Playlist | null>(
    () =>
      segments.length > 0
        ? {
            key: "stream:mine",
            title: "Your stream",
            segments: segments.map((s) => ({
              id: s.id,
              durationMs: s.durationMs,
              transcript: s.transcription,
            })),
            audioUrl: segmentAudioUrl,
          }
        : null,
    [segments],
  );
  const { activeId, playFrom } = usePlaylist(playlist);

  const removeSegment = (id: string) => {
    if (
      !window.confirm(
        "Permanently delete this part of your stream? Audio and text are destroyed.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      const { ok } = await deleteSegmentAction(id);
      if (ok) setSegments((prev) => prev.filter((s) => s.id !== id));
    });
  };

  const removeAll = () => {
    if (
      !window.confirm(
        "Permanently delete your entire Voice Stream? This cannot be undone.",
      )
    )
      return;
    startTransition(async () => {
      await deleteStreamAction();
      setSegments([]);
    });
  };

  const items: TimelineItem[] = [
    ...segments.map((segment) => ({ kind: "segment" as const, segment })),
    ...pending.map((p) => ({
      kind: "uploading" as const,
      id: p.id,
      startedAt: p.span.startedAt.toISOString(),
      durationMs: p.span.durationMs,
      failed: p.failed,
    })),
  ];
  const totalMs = segments.reduce((sum, s) => sum + s.durationMs, 0);

  return (
    <div className="pb-32">
      <RecorderPanel
        recorder={recorder}
        totalMs={totalMs}
        onRecord={() => void record()}
        onPause={pause}
        onStop={finish}
        finishing={carrying}
      />

      {silent ? (
        <p role="status" className="text-dust mt-4 text-center font-sans text-sm">
          No sound came through this time, so there is nothing to carry up yet. Check the
          microphone and speak a little closer.
        </p>
      ) : null}

      {failedUploads ? (
        <button type="button" onClick={retryFailed} className="text-ochre mt-4 text-sm">
          Retry failed uploads
        </button>
      ) : null}

      <div className="mt-10">
        {items.length === 0 ? (
          <p className="font-display text-dust text-center text-xl">
            Your stream is silent. Press record and it keeps running for as long as you
            do.
          </p>
        ) : (
          <Timeline
            items={items}
            activeId={activeId}
            onPlay={playFrom}
            renderDetail={(segment) => (
              <CodexReplay audioUrl={segmentAudioUrl(segment.id)} />
            )}
            renderActions={(segment) => (
              <>
                <ShareButton segmentId={segment.id} label="Share" />
                <button
                  type="button"
                  onClick={() => removeSegment(segment.id)}
                  className="text-dust hover:text-ochre text-sm transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          />
        )}
      </div>

      {segments.length > 0 ? (
        <div className="border-chalk/10 mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <ShareButton segmentId={null} label="Share whole stream" />
          <button
            type="button"
            onClick={removeAll}
            className="text-dust hover:text-ochre text-sm"
          >
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
  onRecord,
  onPause,
  onStop,
  finishing,
}: {
  recorder: ReturnType<typeof useRecorder>;
  totalMs: number;
  onRecord: () => void;
  onPause: () => void;
  onStop: () => void;
  finishing: boolean;
}) {
  const { state, elapsedMs, level, error, supported } = recorder;
  const bars = 28;

  return (
    <section className="border-chalk/10 bg-chalk/[0.02] rounded-sm border px-6 py-8">
      <div className="flex h-14 items-center justify-center gap-[3px]" aria-hidden="true">
        {Array.from({ length: bars }, (_, i) => {
          const wave = Math.sin((i / bars) * Math.PI);
          const h = state === "recording" ? 8 + wave * level * 90 : 6;
          return (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-[height] duration-75 ${
                state === "recording" ? "bg-ochre" : "bg-chalk/25"
              }`}
              style={{ height: `${Math.min(100, h)}%` }}
            />
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {state === "idle" ? (
          <RoundButton
            onClick={onRecord}
            primary
            label="Record"
            disabled={!supported || finishing}
          />
        ) : null}
        {state === "recording" ? (
          <RoundButton onClick={onPause} primary label="Pause" />
        ) : null}
        {state === "paused" ? (
          <RoundButton onClick={onRecord} primary label="Resume" />
        ) : null}
        {state !== "idle" ? <RoundButton onClick={onStop} label="Stop" /> : null}
      </div>

      <p className="text-dust mt-4 text-center font-mono text-xs">
        {finishing && state === "idle"
          ? "Carrying your stream up through the dimensions..."
          : state === "recording"
            ? `Recording · ${formatDuration(elapsedMs)}`
            : state === "paused"
              ? "Paused. Resume when ready."
              : `Stream length ${formatDuration(totalMs)}`}
      </p>
      {error ? (
        <p
          role="alert"
          data-testid="recorder-error"
          className="text-ochre mt-2 text-center text-sm"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}

function RoundButton({
  onClick,
  label,
  primary,
  disabled,
}: {
  onClick: () => void;
  label: string;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-12 min-w-28 rounded-full px-6 font-sans text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        primary
          ? "bg-ochre text-blackboard font-medium hover:opacity-90"
          : "border-chalk/25 text-chalk hover:border-ochre hover:text-ochre border"
      }`}
    >
      {label}
    </button>
  );
}
