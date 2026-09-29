"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { loadBoardAction, type BoardSummary } from "@/app/actions/boards";
import { StreamSource } from "@/features/voice-stream/StreamSource";
import { useStreamTranscript } from "@/features/voice-stream/useStreamTranscript";
import { useCarry } from "@/lib/carry";
import type { BoardDocument } from "@/lib/chalkboard/types";
import { transcriptElements } from "@/lib/voice/transcript";

const Board3D = dynamic(() => import("@/features/chalkboard/Board3D"), {
  ssr: false,
});

type BoardData = { id: string; title: string; doc: BoardDocument };

const STREAM_COLOR = "#d3a34c";

export function GravityChalkboard({
  boards,
  initial,
}: {
  boards: BoardSummary[];
  initial: BoardData | null;
}) {
  const carriedBoardId = useCarry((state) => state.boardId);
  const stream = useStreamTranscript();
  const [boardId, setBoardId] = useState(() =>
    boards.some((board) => board.id === carriedBoardId)
      ? carriedBoardId
      : (initial?.id ?? null),
  );
  const [board, setBoard] = useState<BoardData | null>(() =>
    initial?.id === boardId ? initial : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [timeDepth, setTimeDepth] = useState(true);
  const [until, setUntil] = useState(Number.MAX_SAFE_INTEGER);
  const [showTranscript, setShowTranscript] = useState(true);

  useEffect(() => {
    if (!boardId || board?.id === boardId) return;
    let cancelled = false;
    void loadBoardAction(boardId)
      .then((loaded) => {
        if (!cancelled) setBoard({ id: boardId, ...loaded });
      })
      .catch((loadError: unknown) => {
        if (!cancelled)
          setError(
            loadError instanceof Error ? loadError.message : "Could not load board",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [boardId, board?.id]);

  function selectBoard(id: string) {
    setBoardId(id || null);
    setBoard(id && id === initial?.id ? initial : null);
    setError(null);
  }

  if (boards.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <StreamSource stream={stream} />
        <p className="text-chalk/75 font-sans text-sm">
          Draw something on the 2D board first.{" "}
          <Link href="/chalkboard" className="text-ochre hover:text-chalk">
            Open Infinity Chalkboard
          </Link>
        </p>
      </div>
    );
  }

  const transcript = transcriptElements(stream.segments, STREAM_COLOR);
  const elements = [
    ...(board?.doc.elements ?? []),
    ...(showTranscript ? transcript : []),
  ];
  const times = elements.map((element) => element.createdAt);
  const tMin = times.length ? Math.min(...times) : 0;
  const tMax = times.length ? Math.max(...times) : 0;
  const untilClamped = Math.min(until, tMax);

  return (
    <div className="flex flex-col gap-4">
      <StreamSource stream={stream} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="label" htmlFor="gravity-board-picker">
          Board
        </label>
        <select
          id="gravity-board-picker"
          value={boardId ?? ""}
          onChange={(event) => selectBoard(event.target.value)}
          className="border-chalk/15 bg-blackboard text-chalk h-9 max-w-full rounded-full border px-3 font-sans text-sm"
        >
          {boards.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <span className="label text-ochre">Read-only</span>
      </div>

      <div className="chalk-surface border-chalk/10 relative h-[70vh] min-h-[28rem] overflow-hidden rounded-2xl border">
        {board ? (
          <Board3D elements={elements} timeDepth={timeDepth} until={untilClamped} />
        ) : (
          <p className="text-chalk/70 absolute inset-0 flex items-center justify-center font-sans text-sm">
            {error ?? "Loading board…"}
          </p>
        )}
        <div className="border-chalk/15 bg-blackboard/80 text-chalk/80 absolute top-3 left-3 flex flex-col gap-2 rounded-xl border p-3 font-sans text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={timeDepth}
              onChange={(event) => setTimeDepth(event.target.checked)}
            />
            Time as depth
          </label>
          {tMax > tMin ? (
            <label className="flex items-center gap-2">
              Time
              <input
                type="range"
                min={tMin}
                max={tMax}
                value={untilClamped}
                onChange={(event) => setUntil(Number(event.target.value))}
              />
            </label>
          ) : null}
          <button
            type="button"
            aria-pressed={showTranscript}
            onClick={() => setShowTranscript((visible) => !visible)}
            className="text-dust hover:text-chalk text-left"
          >
            {showTranscript ? "Hide stream" : "Show stream"}
          </button>
        </div>
      </div>
    </div>
  );
}
