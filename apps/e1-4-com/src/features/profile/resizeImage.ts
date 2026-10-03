"use client";

/** Longest side of a stored avatar, in pixels. Plenty for an 88 px circle on a 3x screen. */
export const AVATAR_MAX_SIDE = 512;

/**
 * Shrinks a chosen picture on the device before it is uploaded, so a 12 MB phone photo becomes a
 * few tens of kilobytes. Animated GIFs are left alone (a canvas would keep one frame). Anything
 * the browser cannot decode is returned untouched and the server decides.
 */
export async function resizeImage(file: File, maxSide = AVATAR_MAX_SIDE): Promise<File> {
  if (file.type === "image/gif" || typeof createImageBitmap !== "function") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 256 * 1024) return file;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86),
    );
    if (!blob) return file;
    // Safari before 16 encodes PNG when asked for WebP; keep the name honest either way.
    const type = blob.type || "image/png";
    const ext = type === "image/webp" ? "webp" : type === "image/jpeg" ? "jpg" : "png";
    return new File([blob], `avatar.${ext}`, { type });
  } finally {
    bitmap.close();
  }
}
