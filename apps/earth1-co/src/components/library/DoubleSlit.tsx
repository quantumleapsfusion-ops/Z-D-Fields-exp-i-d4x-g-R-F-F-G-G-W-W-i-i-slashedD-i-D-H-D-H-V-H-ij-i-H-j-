"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const W = 640;
const H = 220;
const FRINGE = 0.09; // fringe spacing as a fraction of the screen
const ENVELOPE = 0.3;
const MAX_HITS = 6000;

/** Relative chance of landing at screen position x in [-0.5, 0.5]. */
function intensity(x: number, watching: boolean): number {
  const envelope = Math.exp(-((x / ENVELOPE) ** 2));
  return watching ? envelope : envelope * Math.cos((Math.PI * x) / FRINGE) ** 2;
}

function sample(watching: boolean): number {
  for (;;) {
    const x = Math.random() - 0.5;
    if (Math.random() <= intensity(x, watching)) return x;
  }
}

/** Electrons fired one at a time; the bands only appear once enough have landed. */
export function DoubleSlit() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const hits = useRef<{ x: number; y: number }[]>([]);
  const [running, setRunning] = useState(false);
  const [watching, setWatching] = useState(false);
  const [count, setCount] = useState(0);

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    const bins = new Array<number>(80).fill(0);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (const { x, y } of hits.current) {
      ctx.fillRect(x * W + W / 2, 125 + y * 85, 1.6, 1.6);
      bins[Math.min(79, Math.floor((x + 0.5) * 80))] += 1;
    }
    const top = Math.max(4, ...bins);
    ctx.fillStyle = "rgba(125,211,252,0.55)";
    bins.forEach((n, i) => {
      const h = (n / top) * 100;
      ctx.fillRect((i / 80) * W, 112 - h, W / 80 - 1, h);
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const step = () => {
      for (let i = 0; i < 6; i += 1) {
        hits.current.push({ x: sample(watching), y: Math.random() });
      }
      setCount(hits.current.length);
      draw();
      if (hits.current.length < MAX_HITS) frame = requestAnimationFrame(step);
      else setRunning(false);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [running, watching, draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  const clear = () => {
    hits.current = [];
    setCount(0);
    setRunning(false);
    draw();
  };

  return (
    <figure className="my-10">
      <canvas
        ref={canvas}
        width={W}
        height={H}
        role="img"
        aria-label="Electrons landing one by one on a screen behind two slits. Unwatched, they build bands; watched, they form one smooth hump."
        className="w-full rounded-sm border border-white/20 bg-black"
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="toggle" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Fire electrons"}
        </button>
        <button
          type="button"
          className="toggle"
          aria-pressed={watching}
          onClick={() => {
            clear();
            setWatching((w) => !w);
          }}
        >
          Watch the slits
        </button>
        <button type="button" className="toggle" onClick={clear}>
          Clear
        </button>
        <span className="source ml-auto">{count.toLocaleString("en")} electrons</span>
      </div>
      <figcaption className="source mt-3">
        Fire a few hundred and each looks like a random dot. Keep going and bands emerge,
        though every electron was sent alone. Switch on &lsquo;Watch the slits&rsquo;, so
        each electron&rsquo;s path is recorded, and the bands dissolve into one smooth
        hump. This is a simulation drawn from the standard interference formula, not
        recorded data.
      </figcaption>
    </figure>
  );
}
