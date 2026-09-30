"use client";

import { useCallback, useEffect, useState } from "react";

import { useCarry } from "@/lib/carry";
import { talkSource } from "@/lib/talk/dimensions";
import { transcriptText, type TranscribedSegment } from "@/lib/voice/transcript";

export type StreamTranscript = {
  segments: TranscribedSegment[];
  text: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useStreamTranscript(): StreamTranscript {
  const carriedText = useCarry((state) => state.text);
  const setCarryText = useCarry((state) => state.setText);
  const [segments, setSegments] = useState<TranscribedSegment[]>([]);
  const [serverText, setServerText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // `?talk=<id>` opens a conversation in this dimension instead of your own stream.
  const requestSegments = useCallback(async () => {
    const talkId = talkSource(window.location.search);
    const response = await fetch(
      talkId ? `/api/talk/${talkId}` : "/api/stream/segments",
      { cache: "no-store" },
    );
    if (!response.ok) throw new Error(`Could not load stream (${response.status})`);
    if (talkId) {
      const data = (await response.json()) as { notes: TranscribedSegment[] };
      return data.notes;
    }
    const data = (await response.json()) as { segments: TranscribedSegment[] };
    return data.segments;
  }, []);

  const commitSegments = useCallback(
    (next: TranscribedSegment[]) => {
      const nextText = transcriptText(next);
      setSegments(next);
      setServerText(nextText);
      if (nextText && !talkSource(window.location.search)) setCarryText(nextText);
    },
    [setCarryText],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      commitSegments(await requestSegments());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load stream");
    } finally {
      setLoading(false);
    }
  }, [commitSegments, requestSegments]);

  useEffect(() => {
    let active = true;
    requestSegments()
      .then((next) => {
        if (active) commitSegments(next);
      })
      .catch((err: unknown) => {
        if (active)
          setError(err instanceof Error ? err.message : "Could not load stream");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [commitSegments, requestSegments]);

  return { segments, text: serverText || carriedText, loading, error, refresh };
}
