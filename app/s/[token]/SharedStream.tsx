'use client';

import { useCallback, useRef, useState } from 'react';

import { StreamPlayer, type StreamPlayerHandle } from '@/features/voice-stream/StreamPlayer';
import { Timeline } from '@/features/voice-stream/Timeline';
import type { SegmentDTO } from '@/lib/voice/stream';

export function SharedStream({
  token,
  segments,
  includeAudio,
  includeTranscript,
}: {
  token: string;
  segments: SegmentDTO[];
  includeAudio: boolean;
  includeTranscript: boolean;
}) {
  const player = useRef<StreamPlayerHandle>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const audioUrl = useCallback((id: string) => `/api/share/${token}/audio/${id}`, [token]);

  if (segments.length === 0) {
    return <p className="mt-8 text-dust">Nothing here yet.</p>;
  }

  return (
    <div className="mt-8">
      {includeAudio ? (
        <div className="sticky top-[4.25rem] z-10 mb-10">
          <StreamPlayer
            ref={player}
            segments={segments}
            audioUrl={audioUrl}
            onActiveChange={setActiveId}
          />
        </div>
      ) : null}
      {!includeTranscript ? <p className="label mb-6">Audio only</p> : null}
      <Timeline
        items={segments.map((segment) => ({ kind: 'segment', segment }))}
        activeId={activeId}
        onPlay={includeAudio ? (id) => player.current?.playFrom(id) : undefined}
      />
    </div>
  );
}
