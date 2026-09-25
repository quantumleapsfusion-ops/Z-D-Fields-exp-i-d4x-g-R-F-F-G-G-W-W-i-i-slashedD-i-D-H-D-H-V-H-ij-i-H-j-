'use client';

import type Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { Circle, Layer, Line, Rect, Stage, Text } from 'react-konva';

import { CANVAS, type DrawOp } from '@/lib/davinci/ops';

/** Renders Da Vinci's drawing ops, animating each as it arrives. Client-only (Konva). */
export default function DaVinciCanvas({ ops }: { ops: DrawOp[] }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(CANVAS.width);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = width / CANVAS.width;

  return (
    <div ref={wrapper} className="w-full">
      <Stage width={width} height={CANVAS.height * scale} scaleX={scale} scaleY={scale}>
        <Layer>
          {ops.map((op, i) => (
            <OpNode key={i} op={op} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

function useEntrance(op: DrawOp) {
  const ref = useRef<Konva.Shape>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    if (op.animate === 'draw' && (op.kind === 'line' || op.kind === 'path')) {
      const line = node as Konva.Line;
      const pts = line.points();
      let length = 0;
      for (let i = 2; i < pts.length; i += 2) {
        length += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
      }
      line.dash([length, length]);
      line.dashOffset(length);
      line.to({ dashOffset: 0, duration: 0.9 });
    } else if (op.animate === 'fade') {
      node.opacity(0);
      node.to({ opacity: 1, duration: 0.8 });
    } else {
      node.opacity(0);
      node.scale({ x: 0.6, y: 0.6 });
      node.to({ opacity: 1, scaleX: 1, scaleY: 1, duration: 0.6 });
    }

    if (op.animate === 'pulse' || op.animate === 'float') {
      const layer = node.getLayer();
      const baseY = node.y();
      let frame = 0;
      const tick = () => {
        const t = performance.now() / 1000;
        if (op.animate === 'pulse')
          node.scale({ x: 1 + Math.sin(t * 2) * 0.04, y: 1 + Math.sin(t * 2) * 0.04 });
        else node.y(baseY + Math.sin(t * 1.3) * 4);
        layer?.batchDraw();
        frame = requestAnimationFrame(tick);
      };
      const start = setTimeout(() => (frame = requestAnimationFrame(tick)), 700);
      return () => {
        clearTimeout(start);
        cancelAnimationFrame(frame);
      };
    }
  }, [op]);
  return ref;
}

function OpNode({ op }: { op: DrawOp }) {
  const ref = useEntrance(op);
  const chalk = {
    shadowColor: op.color,
    shadowBlur: 4,
    shadowOpacity: 0.35,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
  };

  switch (op.kind) {
    case 'circle':
      return (
        <Circle
          ref={(n) => {
            ref.current = n;
          }}
          x={op.x}
          y={op.y}
          radius={op.r}
          stroke={op.color}
          strokeWidth={3}
          fill={op.fill}
          {...chalk}
        />
      );
    case 'rect':
      return (
        <Rect
          ref={(n) => {
            ref.current = n;
          }}
          x={op.x}
          y={op.y}
          width={op.w}
          height={op.h}
          stroke={op.color}
          strokeWidth={3}
          fill={op.fill}
          {...chalk}
        />
      );
    case 'line':
      return (
        <Line
          ref={(n) => {
            ref.current = n;
          }}
          points={op.points}
          stroke={op.color}
          strokeWidth={op.width}
          {...chalk}
        />
      );
    case 'path':
      return (
        <Line
          ref={(n) => {
            ref.current = n;
          }}
          points={op.points}
          stroke={op.color}
          strokeWidth={op.width}
          closed={op.closed}
          fill={op.fill}
          tension={0.35}
          {...chalk}
        />
      );
    case 'text':
      return (
        <Text
          ref={(n) => {
            ref.current = n;
          }}
          x={op.x}
          y={op.y}
          text={op.text}
          fill={op.color}
          fontSize={op.size}
          fontFamily="Fraunces, Georgia, serif"
        />
      );
  }
}
