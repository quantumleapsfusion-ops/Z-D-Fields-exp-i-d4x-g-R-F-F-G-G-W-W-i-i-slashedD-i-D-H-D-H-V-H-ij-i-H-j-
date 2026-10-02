"use client";

import { useEffect, useRef } from "react";

interface WordPlacement {
  word: string;
  at: number; // 0-1, position in transcript
}

/**
 * Canvas-based animated captions synced word-by-word to playback.
 * Words appear with fluid sine-wave motion, matching the Man of Steel aesthetic.
 */
export function AnimatedCaption({
  text,
  positionMs,
  durationMs,
  className,
}: {
  text: string | null | undefined;
  positionMs: number;
  durationMs: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const words = useRef<WordPlacement[]>([]);

  useEffect(() => {
    if (!text) {
      words.current = [];
      return;
    }
    const tokens = text.split(/\s+/).filter(Boolean);
    const total = tokens.reduce((n, w) => n + w.length + 1, 0) || 1;
    const placed: WordPlacement[] = [];
    let acc = 0;
    for (const word of tokens) {
      placed.push({ word, at: acc / total });
      acc += word.length + 1;
    }
    words.current = placed;
  }, [text]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const progress = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 1;
      const fontSize = 18;
      const lineHeight = 32;
      const padding = 20;

      ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(241, 237, 225, 0.8)"; // chalk color

      let y = padding;

      for (const word of words.current) {
        // Calculate reveal phase: words appear 200ms before their scheduled time
        const appearTime = Math.max(0, word.at - 0.1); // 200ms = 0.1 * duration
        const revealPhase = Math.max(0, (progress - appearTime) / 0.2); // 200ms reveal window
        const phase = Math.max(0, Math.min(1, revealPhase));

        if (phase === 0) continue;

        // Wave animation: sine wave undulation
        const wavePhase = Date.now() * 0.008 + words.current.indexOf(word) * 0.3;
        const waveY = Math.sin(wavePhase) * 3;

        // Scale and opacity based on phase
        const scale = 0.8 + phase * 0.2;
        const opacity = phase;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.scale(scale, scale);
        ctx.fillText(word.word, padding / scale, (y + waveY) / scale);
        ctx.restore();

        y += lineHeight;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [positionMs, durationMs]);

  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{
          height: "128px",
          background: "transparent",
        }}
        aria-label="Animated captions"
      />
    </div>
  );
}
