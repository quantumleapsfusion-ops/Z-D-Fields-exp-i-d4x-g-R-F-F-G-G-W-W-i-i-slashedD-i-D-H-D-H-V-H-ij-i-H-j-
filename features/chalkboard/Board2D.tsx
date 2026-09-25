'use client';

import type Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { Arrow, Ellipse, Layer, Line, Rect, Stage, Text } from 'react-konva';

import type { BoardDocument, BoardElement } from '@/lib/chalkboard/types';

export type Tool =
  | 'select'
  | 'pan'
  | 'pen'
  | 'line'
  | 'arrow'
  | 'rect'
  | 'ellipse'
  | 'text'
  | 'eraser';
export type Viewport = BoardDocument['viewport'];
export type Point = { x: number; y: number };

const MIN_SCALE = 0.05;
const MAX_SCALE = 20;
const GRID = 40;

type Props = {
  elements: BoardElement[];
  viewport: Viewport;
  tool: Tool;
  color: string;
  voiceCursor: Point;
  onViewportChange: (viewport: Viewport) => void;
  onChange: (update: (prev: BoardElement[]) => BoardElement[]) => void;
  onVoiceCursor: (point: Point) => void;
};

type TextEdit = { id: string | null; world: Point; value: string };

export function zoomAround(viewport: Viewport, screen: Point, factor: number): Viewport {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, viewport.scale * factor));
  const world = {
    x: (screen.x - viewport.x) / viewport.scale,
    y: (screen.y - viewport.y) / viewport.scale,
  };
  return { scale, x: screen.x - world.x * scale, y: screen.y - world.y * scale };
}

const newId = () => crypto.randomUUID();

/**
 * Production 2D infinite canvas (Konva). The stage transform is the viewport: pan moves it,
 * wheel/pinch-free zoom scales it around the pointer, and every element lives in world space.
 */
export default function Board2D({
  elements,
  viewport,
  tool,
  color,
  voiceCursor,
  onViewportChange,
  onChange,
  onVoiceCursor,
}: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [draft, setDraft] = useState<BoardElement | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [textEdit, setTextEdit] = useState<TextEdit | null>(null);
  const origin = useRef<Point | null>(null);
  const erasing = useRef(false);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const isTyping = (e: KeyboardEvent) =>
      e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTyping(e)) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const up = (e: KeyboardEvent) => e.code === 'Space' && setSpaceHeld(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const panning = tool === 'pan' || spaceHeld;
  const strokeWidth = 3 / viewport.scale;

  function worldPointer(): Point | null {
    return stageRef.current?.getRelativePointerPosition() ?? null;
  }

  function eraseAt(target: Konva.Node) {
    const id = target.id();
    if (id) onChange((prev) => prev.filter((el) => el.id !== id));
  }

  function handleDown(e: Konva.KonvaEventObject<PointerEvent>) {
    if (panning || textEdit) return;
    const p = worldPointer();
    if (!p) return;
    const onEmpty = e.target === e.target.getStage();
    const base = { id: newId(), color, createdAt: Date.now() };

    switch (tool) {
      case 'select':
        if (onEmpty) onVoiceCursor(p);
        return;
      case 'eraser':
        erasing.current = true;
        if (!onEmpty) eraseAt(e.target);
        return;
      case 'text':
        setTextEdit({ id: null, world: p, value: '' });
        return;
      case 'pen':
        setDraft({ ...base, type: 'stroke', points: [p.x, p.y], width: strokeWidth });
        break;
      case 'line':
      case 'arrow':
        setDraft({
          ...base,
          type: 'line',
          points: [p.x, p.y, p.x, p.y],
          width: strokeWidth,
          arrow: tool === 'arrow',
        });
        break;
      case 'rect':
        setDraft({ ...base, type: 'rect', x: p.x, y: p.y, width: 0, height: 0, strokeWidth });
        break;
      case 'ellipse':
        setDraft({ ...base, type: 'ellipse', x: p.x, y: p.y, radiusX: 0, radiusY: 0, strokeWidth });
        break;
    }
    origin.current = p;
  }

  function handleMove(e: Konva.KonvaEventObject<PointerEvent>) {
    if (tool === 'eraser' && erasing.current && e.target !== e.target.getStage()) {
      eraseAt(e.target);
      return;
    }
    if (!draft || !origin.current) return;
    const p = worldPointer();
    if (!p) return;
    const o = origin.current;
    setDraft((d) => {
      if (!d) return d;
      switch (d.type) {
        case 'stroke':
          return { ...d, points: [...d.points, p.x, p.y] };
        case 'line':
          return { ...d, points: [o.x, o.y, p.x, p.y] };
        case 'rect':
          return {
            ...d,
            x: Math.min(o.x, p.x),
            y: Math.min(o.y, p.y),
            width: Math.abs(p.x - o.x),
            height: Math.abs(p.y - o.y),
          };
        case 'ellipse':
          return {
            ...d,
            x: (o.x + p.x) / 2,
            y: (o.y + p.y) / 2,
            radiusX: Math.abs(p.x - o.x) / 2,
            radiusY: Math.abs(p.y - o.y) / 2,
          };
        default:
          return d;
      }
    });
  }

  function handleUp() {
    erasing.current = false;
    origin.current = null;
    if (!draft) return;
    const d = draft;
    setDraft(null);
    const tiny =
      (d.type === 'stroke' && d.points.length < 4) ||
      (d.type === 'line' &&
        Math.hypot(d.points[2] - d.points[0], d.points[3] - d.points[1]) < 2 / viewport.scale) ||
      (d.type === 'rect' && (d.width < 2 / viewport.scale || d.height < 2 / viewport.scale)) ||
      (d.type === 'ellipse' && (d.radiusX < 1 / viewport.scale || d.radiusY < 1 / viewport.scale));
    if (!tiny) onChange((prev) => [...prev, d]);
  }

  function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;
    if (e.evt.ctrlKey || e.evt.metaKey || !e.evt.shiftKey) {
      const factor = Math.exp(-e.evt.deltaY * (e.evt.ctrlKey ? 0.01 : 0.0015));
      onViewportChange(zoomAround(viewport, pointer, factor));
    } else {
      onViewportChange({ ...viewport, x: viewport.x - e.evt.deltaX, y: viewport.y - e.evt.deltaY });
    }
  }

  function commitText() {
    if (!textEdit) return;
    const value = textEdit.value.trim();
    const edit = textEdit;
    setTextEdit(null);
    if (edit.id) {
      onChange((prev) =>
        value
          ? prev.map((el) =>
              el.id === edit.id && el.type === 'text' ? { ...el, text: value } : el,
            )
          : prev.filter((el) => el.id !== edit.id),
      );
    } else if (value) {
      onChange((prev) => [
        ...prev,
        {
          id: newId(),
          type: 'text',
          color,
          createdAt: Date.now(),
          x: edit.world.x,
          y: edit.world.y,
          text: value,
          fontSize: 28 / viewport.scale,
          source: 'typed',
        },
      ]);
    }
  }

  function moveElement(id: string, node: Konva.Node) {
    const dx = node.x();
    const dy = node.y();
    onChange((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;
        if (el.type === 'stroke' || el.type === 'line') {
          node.position({ x: 0, y: 0 });
          return {
            ...el,
            points: el.points.map((v, i) => v + (i % 2 === 0 ? dx : dy)),
          } as BoardElement;
        }
        return { ...el, x: dx, y: dy };
      }),
    );
  }

  function render(el: BoardElement, isDraft = false) {
    const common = {
      id: el.id,
      key: el.id,
      draggable: tool === 'select' && !isDraft,
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true;
        moveElement(el.id, e.target);
      },
      shadowColor: el.color,
      shadowBlur: 3,
      shadowOpacity: 0.3,
      hitStrokeWidth: 12 / viewport.scale,
    };
    switch (el.type) {
      case 'stroke':
        return (
          <Line
            {...common}
            points={el.points}
            stroke={el.color}
            strokeWidth={el.width}
            tension={0.4}
            lineCap="round"
            lineJoin="round"
          />
        );
      case 'line':
        return el.arrow ? (
          <Arrow
            {...common}
            points={el.points}
            stroke={el.color}
            fill={el.color}
            strokeWidth={el.width}
            pointerLength={el.width * 4}
            pointerWidth={el.width * 4}
            lineCap="round"
          />
        ) : (
          <Line
            {...common}
            points={el.points}
            stroke={el.color}
            strokeWidth={el.width}
            lineCap="round"
          />
        );
      case 'rect':
        return (
          <Rect
            {...common}
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            stroke={el.color}
            strokeWidth={el.strokeWidth}
            cornerRadius={2 / viewport.scale}
          />
        );
      case 'ellipse':
        return (
          <Ellipse
            {...common}
            x={el.x}
            y={el.y}
            radiusX={el.radiusX}
            radiusY={el.radiusY}
            stroke={el.color}
            strokeWidth={el.strokeWidth}
          />
        );
      case 'text':
        return (
          <Text
            {...common}
            x={el.x}
            y={el.y}
            text={el.text}
            fill={el.color}
            fontSize={el.fontSize}
            fontFamily={
              el.source === 'voice'
                ? 'Fraunces, Georgia, serif'
                : 'Space Grotesk, system-ui, sans-serif'
            }
            onDblClick={() =>
              tool === 'select' &&
              setTextEdit({ id: el.id, world: { x: el.x, y: el.y }, value: el.text })
            }
          />
        );
    }
  }

  const cursor = panning
    ? 'grab'
    : tool === 'select'
      ? 'default'
      : tool === 'text'
        ? 'text'
        : tool === 'eraser'
          ? 'cell'
          : 'crosshair';
  const gridSize = GRID * viewport.scale;
  const editScreen = textEdit
    ? {
        left: textEdit.world.x * viewport.scale + viewport.x,
        top: textEdit.world.y * viewport.scale + viewport.y,
      }
    : null;

  return (
    <div
      ref={wrapper}
      className="relative h-full w-full overflow-hidden"
      style={{
        cursor,
        touchAction: 'none',
        backgroundImage:
          gridSize >= 8
            ? 'radial-gradient(rgb(var(--color-chalk) / 0.12) 1px, transparent 1px)'
            : undefined,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        draggable={panning}
        onDragMove={(e) => {
          if (e.target === e.target.getStage())
            onViewportChange({ ...viewport, x: e.target.x(), y: e.target.y() });
        }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        onWheel={handleWheel}
      >
        <Layer>
          {elements.map((el) => render(el))}
          {draft ? render(draft, true) : null}
          <Rect
            x={voiceCursor.x - 6 / viewport.scale}
            y={voiceCursor.y}
            width={3 / viewport.scale}
            height={30 / viewport.scale}
            fill="#d3a34c"
            opacity={0.8}
            listening={false}
          />
        </Layer>
      </Stage>
      {textEdit && editScreen ? (
        <input
          autoFocus
          value={textEdit.value}
          onChange={(e) => setTextEdit({ ...textEdit, value: e.target.value })}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitText();
            if (e.key === 'Escape') setTextEdit(null);
          }}
          aria-label="Board text"
          className="absolute min-w-[12rem] rounded border border-ochre/60 bg-blackboard/90 px-2 py-1 font-sans text-chalk focus:outline-none"
          style={{ left: editScreen.left, top: editScreen.top, fontSize: 18 }}
        />
      ) : null}
    </div>
  );
}
