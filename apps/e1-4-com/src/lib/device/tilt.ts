/** How the phone leans relative to where it was first held, each axis in -1..1. */
export type Tilt = { x: number; y: number };

export type Orientation = { beta: number; gamma: number };

/** Degrees of lean that count as a full tilt. */
const FULL_TILT_DEG = 35;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/**
 * Maps a device orientation reading onto screen axes: `x` grows as the right edge dips, `y` grows as
 * the top edge dips. `angle` is the screen rotation (0, 90, 180, 270) so landscape reads the same.
 */
export function tiltFrom(reading: Orientation, neutral: Orientation, angle = 0): Tilt {
  const gamma = (reading.gamma - neutral.gamma) / FULL_TILT_DEG;
  const beta = (neutral.beta - reading.beta) / FULL_TILT_DEG;
  switch (((angle % 360) + 360) % 360) {
    case 90:
      return { x: clamp(-beta), y: clamp(gamma) };
    case 180:
      return { x: clamp(-gamma), y: clamp(-beta) };
    case 270:
      return { x: clamp(beta), y: clamp(-gamma) };
    default:
      return { x: clamp(gamma), y: clamp(beta) };
  }
}

type PermissionedOrientation = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

/**
 * iOS only reports motion after the visitor allows it, and only from inside a tap. Call this from
 * the tap handler; elsewhere motion is already on and this resolves immediately.
 */
export async function requestTilt(): Promise<boolean> {
  if (typeof window === "undefined" || !("DeviceOrientationEvent" in window))
    return false;
  const ctor = DeviceOrientationEvent as PermissionedOrientation;
  if (typeof ctor.requestPermission !== "function") return true;
  try {
    return (await ctor.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

/** Streams the phone's lean to `onTilt` until the returned function is called. */
export function watchTilt(onTilt: (tilt: Tilt) => void): () => void {
  if (typeof window === "undefined") return () => {};
  let neutral: Orientation | null = null;
  const onOrientation = (event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null) return;
    const reading = { beta: event.beta, gamma: event.gamma };
    neutral ??= reading;
    onTilt(tiltFrom(reading, neutral, window.screen.orientation?.angle ?? 0));
  };
  window.addEventListener("deviceorientation", onOrientation);
  return () => window.removeEventListener("deviceorientation", onOrientation);
}
