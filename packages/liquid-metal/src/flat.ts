import { Fluid } from "./fluid";
import type { ShapeFn, TintFn } from "./LiquidMetal";
import { voiceRipples } from "./ripples";

type Live = {
  shape: ShapeFn;
  tint?: TintFn;
  pulse: number;
  level: number;
  levelSource?: () => number;
};

/**
 * The same liquid drawn flat on a 2D canvas, for devices where WebGL is missing or lost. Each
 * bead is one pixel of a small image, lit by its slope and height, then scaled up to the screen.
 * Under reduced motion it draws one still frame. Returns a cleanup function.
 */
export function runFlat(
  el: HTMLElement,
  live: { current: Live },
  cols: number,
  rows: number,
  pitch: number,
  cellsPerDefault: number,
): () => void {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100%;height:100%;image-rendering:auto";
  el.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const small = document.createElement("canvas");
  small.width = cols;
  small.height = rows;
  const sctx = small.getContext("2d");
  if (!ctx || !sctx) {
    el.removeChild(canvas);
    return () => {};
  }
  const image = sctx.createImageData(cols, rows);
  const fluid = new Fluid(cols, rows);
  fluid.waveSpeed *= cellsPerDefault;
  const slope: [number, number] = [0, 0];
  const rgb: [number, number, number] = [0, 0, 0];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const fillTarget = (t: number) => {
    const fn = live.current.shape;
    for (let row = 0; row < rows; row += 1) {
      const y = (row - (rows - 1) / 2) * pitch;
      for (let col = 0; col < cols; col += 1) {
        const x = (col - (cols - 1) / 2) * pitch;
        fluid.target[row * cols + col] = Math.max(
          0,
          Math.min(1.15, fn(x, y, t, col / cols, row / rows)),
        );
      }
    }
  };

  const draw = () => {
    const w = Math.max(1, el.clientWidth);
    const h = Math.max(1, el.clientHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * ratio)) canvas.width = Math.round(w * ratio);
    if (canvas.height !== Math.round(h * ratio)) canvas.height = Math.round(h * ratio);
    const tint = live.current.tint;
    const data = image.data;
    for (let row = 0; row < rows; row += 1) {
      const y = (row - (rows - 1) / 2) * pitch;
      for (let col = 0; col < cols; col += 1) {
        const x = (col - (cols - 1) / 2) * pitch;
        const i = row * cols + col;
        fluid.gradient(col, row, slope);
        const z = fluid.height[i];
        // Light from the upper left: a bright face toward it, dark away, plus a sheen on the crests.
        const light = 0.55 + (slope[1] - slope[0]) * 2.4 * cellsPerDefault + z * 0.35;
        let v = Math.max(0.08, Math.min(1, light)) * 210;
        let r = v;
        let g = v * 1.01;
        let b = v * 1.06;
        const amount = tint ? Math.max(0, Math.min(1, tint(x, y, rgb))) : 0;
        if (amount > 0) {
          v = Math.max(0.3, light);
          r += (rgb[0] * 255 * v - r) * amount;
          g += (rgb[1] * 255 * v - g) * amount;
          b += (rgb[2] * 255 * v - b) * amount;
        }
        // Row 0 is the bottom of the world; images run top down.
        const o = ((rows - 1 - row) * cols + col) * 4;
        data[o] = r;
        data[o + 1] = g;
        data[o + 2] = b;
        data[o + 3] = 255;
      }
    }
    sctx.putImageData(image, 0, 0);
    // Cover the screen like the 3D field does, keeping beads square.
    const scale = Math.max(canvas.width / cols, canvas.height / rows);
    const dw = cols * scale;
    const dh = rows * scale;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(small, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
  };

  fillTarget(0);
  fluid.settle();
  draw();

  let frame = 0;
  let last = 0;
  let lastPulse = live.current.pulse;
  let nextDrop = 1.6;
  const start = performance.now() / 1000;
  const loop = (ms: number) => {
    frame = requestAnimationFrame(loop);
    if (document.hidden || reduced.matches) return;
    const now = ms / 1000 - start;
    const dt = last ? Math.min(0.1, now - last) : 1 / 60;
    last = now;
    fillTarget(now);
    const { pulse } = live.current;
    const level = live.current.levelSource?.() ?? live.current.level;
    if (pulse !== lastPulse) {
      lastPulse = pulse;
      fluid.splash((cols - 1) / 2, (rows - 1) / 2, 4 * cellsPerDefault, -9);
    }
    if (level > 0.02) voiceRipples(fluid, now, level, cellsPerDefault);
    if (now > nextDrop) {
      nextDrop = now + 1.6 * (0.6 + Math.random());
      fluid.splash(
        Math.random() * cols,
        Math.random() * rows,
        2.5 * cellsPerDefault,
        -2.4,
      );
    }
    fluid.step(dt);
    draw();
  };
  frame = requestAnimationFrame(loop);
  const ro = new ResizeObserver(() => draw());
  ro.observe(el);

  return () => {
    cancelAnimationFrame(frame);
    ro.disconnect();
    if (canvas.parentNode === el) el.removeChild(canvas);
  };
}
