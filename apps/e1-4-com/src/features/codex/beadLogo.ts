/**
 * The e1-4 mark (Ψ over π) as a grid: `cover` is 0 outside the glyph and 1 inside. Row 0 is the
 * top of the mark.
 */
export type LogoMask = {
  width: number;
  height: number;
  cover: Float32Array;
};

/** The glyph cut out of the brand mark, on a transparent background. */
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

/** RGBA bytes → mask: alpha is coverage. */
export function maskFromPixels(
  width: number,
  height: number,
  pixels: ArrayLike<number>,
): LogoMask {
  const cover = new Float32Array(width * height);
  for (let i = 0; i < cover.length; i += 1) cover[i] = pixels[i * 4 + 3] / 255;
  return { width, height, cover };
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
