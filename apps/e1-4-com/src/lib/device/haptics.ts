/** Vibration patterns in milliseconds (buzz, pause, buzz, ...). */
export const HAPTICS = {
  start: [30],
  stop: [20, 40, 20],
  saved: [15, 30, 15, 30, 60],
  stage: [25],
  accepted: [20, 30, 60],
  rejected: [80, 40, 80],
  voice: [8],
} as const satisfies Record<string, readonly number[]>;

export type Haptic = keyof typeof HAPTICS;

/** Buzzes the device where the browser allows it (Android); a silent no-op everywhere else. */
export function haptic(kind: Haptic): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate([...HAPTICS[kind]]);
  } catch {
    // Some in-app browsers expose vibrate but throw when it is called.
  }
}
