import { brand } from "@earth-one/ui";

/** Coverage of the e1-4 mark (Ψ over π) on a `width` × `height` grid, 0 outside the strokes and 1 inside. */
export type LogoMask = { width: number; height: number; cover: Float32Array };

/** Height over width of the mark. */
export const LOGO_ASPECT = 1.45;

/** Draws the mark as clean round-capped strokes into an offscreen canvas and reads back how much of each cell it covers. */
export function drawLogoMask(width = 180): LogoMask {
  const height = Math.round(width * LOGO_ASPECT);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const cover = new Float32Array(width * height);
  if (!ctx) return { width, height, cover };
  const w = width;
  const h = height;
  const cx = w / 2;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = w * 0.1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const stroke = (draw: () => void) => {
    ctx.beginPath();
    draw();
    ctx.stroke();
  };
  const cup = w * 0.33;
  const cupY = h * 0.2;
  stroke(() => {
    ctx.moveTo(cx - cup, h * 0.06);
    ctx.lineTo(cx - cup, cupY);
    ctx.arc(cx, cupY, cup, Math.PI, 0, true);
    ctx.lineTo(cx + cup, h * 0.06);
  });
  stroke(() => {
    ctx.moveTo(cx, h * 0.04);
    ctx.lineTo(cx, h * 0.56);
  });
  const bar = h * 0.67;
  stroke(() => {
    ctx.moveTo(w * 0.12, bar);
    ctx.lineTo(w * 0.88, bar);
  });
  stroke(() => {
    ctx.moveTo(w * 0.35, bar);
    ctx.quadraticCurveTo(w * 0.34, h * 0.86, w * 0.24, h * 0.95);
  });
  stroke(() => {
    ctx.moveTo(w * 0.65, bar);
    ctx.lineTo(w * 0.65, h * 0.88);
    ctx.quadraticCurveTo(w * 0.66, h * 0.95, w * 0.78, h * 0.94);
  });
  const pixels = ctx.getImageData(0, 0, width, height).data;
  for (let i = 0; i < cover.length; i += 1) cover[i] = pixels[i * 4 + 3] / 255;
  return { width, height, cover };
}

/**
 * Coverage at `u`, `v` in -1..1 across the mark (`v` = 1 at the top), bilinearly smoothed so beads
 * drifting through a stroke fade in and out rather than blink.
 */
export function sampleMask(
  { width, height, cover }: LogoMask,
  u: number,
  v: number,
): number {
  if (u <= -1 || u >= 1 || v <= -1 || v >= 1) return 0;
  const x = ((u + 1) / 2) * (width - 1);
  const y = ((1 - v) / 2) * (height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const fx = x - x0;
  const fy = y - y0;
  const top = cover[y0 * width + x0] * (1 - fx) + cover[y0 * width + x1] * fx;
  const bottom = cover[y1 * width + x0] * (1 - fx) + cover[y1 * width + x1] * fx;
  return top * (1 - fy) + bottom * fy;
}

const RAINBOW = brand.rainbow.map((hex) => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
]);

/** The brand rainbow from red at `t` = 0 to violet at `t` = 1, as linear-ish RGB in 0..1. */
export function rainbowAt(t: number): [number, number, number] {
  const s = Math.max(0, Math.min(1, t)) * (RAINBOW.length - 1);
  const i = Math.min(RAINBOW.length - 2, Math.floor(s));
  const f = s - i;
  const [a, b] = [RAINBOW[i], RAINBOW[i + 1]];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}
