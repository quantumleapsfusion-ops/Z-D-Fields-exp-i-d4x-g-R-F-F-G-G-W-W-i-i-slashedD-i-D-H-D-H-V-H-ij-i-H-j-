/**
 * The e1-4 mark (Ψ over π) as a grid: `cover` is 0 outside the glyph and 1 inside, `color` its
 * sRGB colour (0..1, three values per cell). Row 0 is the top of the mark.
 */
export type LogoMask = {
  width: number;
  height: number;
  cover: Float32Array;
  color: Float32Array;
};

/** The glyph cut out of the brand mark, with its rainbow colours and a transparent background. */
export const LOGO_GLYPH = "/brand/e1-4-glyph.png";

/** Reads the glyph image back into a mask. */
export async function loadLogoMask(src = LOGO_GLYPH): Promise<LogoMask> {
  const image = new Image();
  image.src = src;
  await image.decode();
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D canvas");
  ctx.drawImage(image, 0, 0);
  return maskFromPixels(width, height, ctx.getImageData(0, 0, width, height).data);
}

/** RGBA bytes → mask: alpha is coverage, RGB the colour. */
export function maskFromPixels(
  width: number,
  height: number,
  pixels: ArrayLike<number>,
): LogoMask {
  const cover = new Float32Array(width * height);
  const color = new Float32Array(width * height * 3);
  for (let i = 0; i < cover.length; i += 1) {
    cover[i] = pixels[i * 4 + 3] / 255;
    color[i * 3] = pixels[i * 4] / 255;
    color[i * 3 + 1] = pixels[i * 4 + 1] / 255;
    color[i * 3 + 2] = pixels[i * 4 + 2] / 255;
  }
  return { width, height, cover, color };
}

/** Height over width of the mark. */
export function logoAspect({ width, height }: LogoMask): number {
  return height / width;
}

function cell({ width, height }: LogoMask, u: number, v: number) {
  const x = ((u + 1) / 2) * (width - 1);
  const y = ((1 - v) / 2) * (height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  return {
    x0,
    y0,
    x1: Math.min(width - 1, x0 + 1),
    y1: Math.min(height - 1, y0 + 1),
    fx: x - x0,
    fy: y - y0,
  };
}

/**
 * Coverage at `u`, `v` in -1..1 across the mark (`v` = 1 at the top), bilinearly smoothed so beads
 * drifting through a stroke fade in and out rather than blink.
 */
export function sampleMask(mask: LogoMask, u: number, v: number): number {
  if (u <= -1 || u >= 1 || v <= -1 || v >= 1) return 0;
  const { width, cover } = mask;
  const { x0, y0, x1, y1, fx, fy } = cell(mask, u, v);
  const top = cover[y0 * width + x0] * (1 - fx) + cover[y0 * width + x1] * fx;
  const bottom = cover[y1 * width + x0] * (1 - fx) + cover[y1 * width + x1] * fx;
  return top * (1 - fy) + bottom * fy;
}

/** The mark's sRGB colour at `u`, `v` (nearest cell), written into `out`. */
export function sampleColor(
  mask: LogoMask,
  u: number,
  v: number,
  out: [number, number, number],
): [number, number, number] {
  const c = Math.max(-1, Math.min(1, u));
  const r = Math.max(-1, Math.min(1, v));
  const { x0, y0, fx, fy, x1, y1 } = cell(mask, c, r);
  const i = ((fy < 0.5 ? y0 : y1) * mask.width + (fx < 0.5 ? x0 : x1)) * 3;
  out[0] = mask.color[i];
  out[1] = mask.color[i + 1];
  out[2] = mask.color[i + 2];
  return out;
}
