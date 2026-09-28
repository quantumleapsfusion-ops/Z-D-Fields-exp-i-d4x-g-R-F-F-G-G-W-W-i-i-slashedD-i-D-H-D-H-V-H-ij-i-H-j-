"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
  deleteBoardAction,
  loadBoardAction,
  saveBoardAction,
  type BoardSummary,
} from "@/app/actions/boards";
import { LiveControls } from "@/features/live/LiveControls";
import {
  useLiveTranscription,
  type FinalPhrase,
} from "@/features/live/useLiveTranscription";
import { DRAFT_KEY, localBoards } from "@/lib/chalkboard/local";
import type { BoardDocument, BoardElement } from "@/lib/chalkboard/types";
import { flags } from "@/lib/flags";

import { zoomAround, type Point, type Tool, type Viewport } from "./Board2D";
import { parseVoice, shapeAt } from "./voice";

const Board2D = dynamic(() => import("./Board2D"), { ssr: false });
const Board3D = dynamic(() => import("./Board3D"), { ssr: false });

type Mode = "2d" | "3d" | "4d";

const TOOLS: { id: Tool; label: string; key: string }[] = [
  { id: "select", label: "Select", key: "v" },
  { id: "pan", label: "Pan", key: "h" },
  { id: "pen", label: "Chalk", key: "p" },
  { id: "line", label: "Line", key: "l" },
  { id: "arrow", label: "Arrow", key: "a" },
  { id: "rect", label: "Box", key: "r" },
  { id: "ellipse", label: "Ellipse", key: "o" },
  { id: "text", label: "Text", key: "t" },
  { id: "math", label: "Math", key: "m" },
  { id: "eraser", label: "Erase", key: "e" },
];

const COLORS = [
  "#f1ede1",
  "#93a294",
  "#d3a34c",
  "#e8857a",
  "#7fb7d9",
  "#9ccf8f",
  "#e9d25a",
];

type History = {
  past: BoardElement[][];
  present: BoardElement[];
  future: BoardElement[][];
};
type HistoryAction =
  | { type: "apply"; update: (prev: BoardElement[]) => BoardElement[] }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; elements: BoardElement[] };

function historyReducer(state: History, action: HistoryAction): History {
  switch (action.type) {
    case "apply": {
      const next = action.update(state.present);
      if (next === state.present) return state;
      return {
        past: [...state.past.slice(-99), state.present],
        present: next,
        future: [],
      };
    }
    case "undo": {
      const prev = state.past.at(-1);
      if (!prev) return state;
      return {
        past: state.past.slice(0, -1),
        present: prev,
        future: [state.present, ...state.future],
      };
    }
    case "redo": {
      const [next, ...rest] = state.future;
      if (!next) return state;
      return { past: [...state.past, state.present], present: next, future: rest };
    }
    case "reset":
      return { past: [], present: action.elements, future: [] };
  }
}

type SaveState = "idle" | "saving" | "saved" | "error";

/** Infinity Chalkboard — the 2D board is production-ready; 3D/4D are flagged scaffolds. */
export function InfinityChalkboard({
  initialBoards,
  initial,
}: {
  initialBoards: BoardSummary[];
  initial: { id: string | null; title: string; doc: BoardDocument };
}) {
  const [boards, setBoards] = useState(initialBoards);
  const [boardId, setBoardId] = useState(initial.id);
  const [title, setTitle] = useState(initial.title);
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initial.doc.elements,
    future: [],
  });
  const [viewport, setViewport] = useState<Viewport>(initial.doc.viewport);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [mode, setMode] = useState<Mode>("2d");
  const [timeDepth, setTimeDepth] = useState(true);
  const [until, setUntil] = useState(Number.MAX_SAFE_INTEGER);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [revision, setRevision] = useState(0);
  const [voiceCursor, setVoiceCursor] = useState<Point>({ x: 80, y: 80 });
  const [localRestore, setLocalRestore] = useState<{
    doc: BoardDocument;
    updatedAt: number;
  } | null>(null);

  const elements = history.present;
  const viewportRef = useRef(viewport);
  const cursorRef = useRef(voiceCursor);
  const colorRef = useRef(color);
  useEffect(() => {
    viewportRef.current = viewport;
    cursorRef.current = voiceCursor;
    colorRef.current = color;
  }, [viewport, voiceCursor, color]);

  const change = useCallback((update: (prev: BoardElement[]) => BoardElement[]) => {
    dispatch({ type: "apply", update });
    setRevision((r) => r + 1);
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "undo" });
    setRevision((r) => r + 1);
  }, []);
  const redo = useCallback(() => {
    dispatch({ type: "redo" });
    setRevision((r) => r + 1);
  }, []);

  const onPhrase = useCallback(
    (phrase: FinalPhrase) => {
      const action = parseVoice(phrase.text);
      const at = cursorRef.current;
      const scale = viewportRef.current.scale;
      if (action.kind === "undo") return undo();
      if (action.kind === "shape") {
        change((prev) => [...prev, shapeAt(action.shape, at, scale, colorRef.current)]);
        setVoiceCursor({ x: at.x, y: at.y + 110 / scale });
        return;
      }
      const fontSize = 28 / scale;
      change((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "text",
          color: colorRef.current,
          createdAt: phrase.at,
          x: at.x,
          y: at.y,
          text: action.text,
          fontSize,
          source: "voice",
        },
      ]);
      setVoiceCursor({ x: at.x, y: at.y + fontSize * 1.5 });
    },
    [change, undo],
  );

  const live = useLiveTranscription(onPhrase);

  // Autosave (debounced). Serialised so a new board is only created once.
  const saving = useRef(false);
  const queued = useRef(false);
  const latest = useRef({ boardId, title, elements, viewport });
  useEffect(() => {
    latest.current = { boardId, title, elements, viewport };
  }, [boardId, title, elements, viewport]);

  const saveRef = useRef<() => Promise<void>>(async () => {});
  const save = useCallback(async () => {
    if (saving.current) {
      queued.current = true;
      return;
    }
    saving.current = true;
    setSaveState("saving");
    try {
      const cur = latest.current;
      const { id } = await saveBoardAction({
        id: cur.boardId,
        title: cur.title,
        doc: { version: 1, elements: cur.elements, viewport: cur.viewport },
      });
      if (cur.boardId !== id) void localBoards.rename(cur.boardId ?? DRAFT_KEY, id);
      latest.current.boardId = id;
      setBoardId(id);
      setBoards((prev) => {
        const rest = prev.filter((b) => b.id !== id);
        return [
          {
            id,
            title: cur.title || "Untitled board",
            updatedAt: new Date().toISOString(),
          },
          ...rest,
        ];
      });
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      saving.current = false;
      if (queued.current) {
        queued.current = false;
        void saveRef.current();
      }
    }
  }, []);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (revision === 0) return;
    const timer = setTimeout(() => void save(), 1200);
    return () => clearTimeout(timer);
  }, [revision, save]);

  // Local-first mirror: every change lands in IndexedDB immediately; the server save follows.
  useEffect(() => {
    if (revision === 0) return;
    void localBoards.put({
      key: boardId ?? DRAFT_KEY,
      title,
      doc: { version: 1, elements, viewport },
      syncedAt: null,
    });
  }, [revision, boardId, title, elements, viewport]);

  useEffect(() => {
    if (saveState === "saved" && boardId) void localBoards.markSynced(boardId);
  }, [saveState, boardId]);

  // Offer to restore a local copy that never made it to the server (crash, offline, failed save).
  const initialKey = initial.id ?? DRAFT_KEY;
  const initialCount = initial.doc.elements.length;
  useEffect(() => {
    let cancelled = false;
    void localBoards.get(initialKey).then((local) => {
      if (cancelled || !local || local.syncedAt !== null) return;
      if (local.doc.elements.length > initialCount) {
        setLocalRestore({ doc: local.doc, updatedAt: local.updatedAt });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialKey, initialCount]);

  const restoreLocal = useCallback(() => {
    if (!localRestore) return;
    dispatch({ type: "reset", elements: localRestore.doc.elements });
    setViewport(localRestore.doc.viewport);
    setLocalRestore(null);
    setRevision((r) => r + 1);
  }, [localRestore]);

  const dismissLocal = useCallback(() => {
    setLocalRestore(null);
    void localBoards.remove(initialKey);
  }, [initialKey]);

  const changeViewport = useCallback((v: Viewport) => {
    setViewport(v);
    setRevision((r) => r + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod) return;
      const match = TOOLS.find((t) => t.key === e.key.toLowerCase());
      if (match) setTool(match.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  async function openBoard(id: string) {
    const board = await loadBoardAction(id);
    setBoardId(id);
    setTitle(board.title);
    dispatch({ type: "reset", elements: board.doc.elements });
    setViewport(board.doc.viewport);
    setSaveState("idle");
  }

  function newBoard() {
    setBoardId(null);
    setTitle("Untitled board");
    dispatch({ type: "reset", elements: [] });
    setViewport({ x: 0, y: 0, scale: 1 });
    setVoiceCursor({ x: 80, y: 80 });
    setSaveState("idle");
    live.reset();
  }

  async function removeBoard() {
    if (!boardId || !window.confirm("Delete this board permanently?")) return;
    await deleteBoardAction(boardId);
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    newBoard();
  }

  const times = elements.map((e) => e.createdAt);
  const tMin = times.length ? Math.min(...times) : 0;
  const tMax = times.length ? Math.max(...times) : 0;
  const untilClamped = Math.min(until, tMax);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setRevision((r) => r + 1);
          }}
          aria-label="Board title"
          className="font-display text-chalk min-w-0 basis-full bg-transparent text-2xl focus:outline-none sm:flex-1 sm:basis-auto"
        />
        <span className="label" aria-live="polite">
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "Saved"
              : saveState === "error"
                ? "Save failed"
                : ""}
        </span>
        {localRestore ? (
          <span
            role="status"
            className="border-ochre/50 text-chalk flex items-center gap-3 rounded-full border px-3 py-1 font-sans text-sm"
          >
            Unsaved local copy from{" "}
            {new Date(localRestore.updatedAt).toLocaleTimeString()}
            <button
              type="button"
              onClick={restoreLocal}
              className="label hover:text-ochre"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={dismissLocal}
              className="label hover:text-chalk"
            >
              Discard
            </button>
          </span>
        ) : null}
        <select
          value={boardId ?? ""}
          onChange={(e) => (e.target.value ? void openBoard(e.target.value) : newBoard())}
          aria-label="Open board"
          className="border-chalk/15 bg-blackboard text-chalk h-9 rounded-full border px-3 font-sans text-sm"
        >
          <option value="">New board</option>
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
        <button type="button" onClick={newBoard} className="label hover:text-chalk">
          New
        </button>
        {boardId ? (
          <button
            type="button"
            onClick={() => void removeBoard()}
            className="label hover:text-ochre"
          >
            Delete
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="radiogroup"
          aria-label="Dimensions"
          className="border-chalk/15 flex rounded-full border p-1"
        >
          {(
            [
              { id: "2d", label: "2D", enabled: true, hint: "Production" },
              {
                id: "3d",
                label: "3D",
                enabled: flags.chalkboard3d,
                hint: "Experimental — set NEXT_PUBLIC_FEATURE_CHALKBOARD_3D=true",
              },
              {
                id: "4d",
                label: "4D",
                enabled: flags.chalkboard4d,
                hint: "Future — set NEXT_PUBLIC_FEATURE_CHALKBOARD_4D=true to preview the placeholder",
              },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              disabled={!m.enabled}
              title={m.hint}
              onClick={() => setMode(m.id)}
              className={`rounded-full px-4 py-1 font-sans text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                mode === m.id
                  ? "bg-chalk text-blackboard"
                  : "text-chalk/80 hover:text-chalk"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "2d" ? (
          <div className="flex flex-wrap items-center gap-1">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={tool === t.id}
                title={`${t.label} (${t.key.toUpperCase()})`}
                onClick={() => setTool(t.id)}
                className={`rounded-full px-3 py-1 font-sans text-xs transition-colors ${
                  tool === t.id
                    ? "bg-ochre text-blackboard"
                    : "text-chalk/75 hover:text-chalk"
                }`}
              >
                {t.label}
              </button>
            ))}
            <span className="bg-chalk/15 mx-2 h-5 w-px" aria-hidden="true" />
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Colour ${c}`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className={`h-5 w-5 rounded-full border ${color === c ? "border-chalk ring-ochre/60 ring-2" : "border-chalk/20"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="chalk-surface border-chalk/10 relative h-[70vh] min-h-[28rem] overflow-hidden rounded-2xl border">
        {mode === "2d" ? (
          <>
            <Board2D
              elements={elements}
              viewport={viewport}
              tool={tool}
              color={color}
              voiceCursor={voiceCursor}
              onViewportChange={changeViewport}
              onChange={change}
              onVoiceCursor={setVoiceCursor}
            />
            <div className="border-chalk/15 bg-blackboard/80 text-chalk/80 absolute right-3 bottom-3 flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-xs">
              <button
                type="button"
                aria-label="Zoom out"
                className="px-2"
                onClick={() =>
                  changeViewport(zoomAround(viewport, { x: 400, y: 300 }, 1 / 1.25))
                }
              >
                −
              </button>
              <button
                type="button"
                aria-label="Reset zoom"
                className="w-14 text-center"
                onClick={() => changeViewport({ x: 0, y: 0, scale: 1 })}
              >
                {Math.round(viewport.scale * 100)}%
              </button>
              <button
                type="button"
                aria-label="Zoom in"
                className="px-2"
                onClick={() =>
                  changeViewport(zoomAround(viewport, { x: 400, y: 300 }, 1.25))
                }
              >
                +
              </button>
              <span className="bg-chalk/15 mx-1 h-4 w-px" />
              <button
                type="button"
                onClick={undo}
                disabled={!history.past.length}
                className="px-2 disabled:opacity-30"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!history.future.length}
                className="px-2 disabled:opacity-30"
              >
                Redo
              </button>
            </div>
          </>
        ) : mode === "3d" ? (
          <>
            <Board3D elements={elements} timeDepth={timeDepth} until={untilClamped} />
            <div className="border-chalk/15 bg-blackboard/80 text-chalk/80 absolute top-3 left-3 flex flex-col gap-2 rounded-xl border p-3 font-sans text-xs">
              <span className="label text-ochre">Experimental · read-only</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={timeDepth}
                  onChange={(e) => setTimeDepth(e.target.checked)}
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
                    onChange={(e) => setUntil(Number(e.target.value))}
                  />
                </label>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="label text-ochre">Future · not launch-complete</p>
            <p className="font-display max-w-lg text-2xl">
              Four dimensions: space you can walk into, and time you can scrub.
            </p>
            <p className="text-chalk/70 max-w-lg font-sans text-sm">
              The board already stamps every element with its creation time — the fourth
              axis. The experimental 3D view uses it as depth and as a time slider; a
              navigable 4D spacetime is planned, not built.
            </p>
          </div>
        )}
      </div>

      <LiveControls live={live} placeholder="Type a line onto the board…" />
      <p className="text-dust font-sans text-xs">
        Speak and your words land at the ochre cursor (click the board with Select to move
        it). Say “draw a circle”, “add an arrow”, “draw a box” or “undo”. Scroll to zoom,
        hold Space to pan.
      </p>
    </div>
  );
}
