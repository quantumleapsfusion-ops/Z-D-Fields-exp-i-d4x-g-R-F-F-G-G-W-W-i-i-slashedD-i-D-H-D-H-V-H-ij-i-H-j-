/** Where a device remembers that it has heard the introduction. */
export const INTRO_KEY = "e14:intro-heard";

/**
 * Whether a first gesture should be answered with the spoken introduction.
 *
 * Nothing is said when the device has heard it before, when the gesture is the microphone itself
 * (speaking over someone who is about to speak would be rude, and would land in their recording),
 * or when the synthesiser is already talking.
 */
export function shouldSpeakIntro({
  heard,
  onMic,
  speaking,
}: {
  heard: boolean;
  onMic: boolean;
  speaking: boolean;
}): boolean {
  return !heard && !onMic && !speaking;
}
