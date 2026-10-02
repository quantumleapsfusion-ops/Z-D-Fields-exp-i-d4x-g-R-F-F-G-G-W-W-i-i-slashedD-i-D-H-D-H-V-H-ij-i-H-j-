/**
 * Hears when someone has finished speaking, from the microphone's peak level. Speech has to run
 * for `minSpeechMs` first, so a cough does not end the answer, and then stay below `quiet` for
 * `silenceMs`. Pure, so it is tested without a microphone.
 */
export type EndpointOptions = {
  /** Peak level (0 to 1) that counts as voice. */
  loud?: number;
  /** Peak level below which the room counts as quiet. */
  quiet?: number;
  minSpeechMs?: number;
  silenceMs?: number;
};

export function endOfSpeech({
  loud = 0.08,
  quiet = 0.04,
  minSpeechMs = 900,
  silenceMs = 650,
}: EndpointOptions = {}) {
  let speechStart: number | null = null;
  let quietSince: number | null = null;
  let done = false;
  /** Feed one level reading; returns `true` once, on the reading that ends the answer. */
  return (level: number, at: number): boolean => {
    if (done) return false;
    if (level >= loud) {
      speechStart ??= at;
      quietSince = null;
      return false;
    }
    if (speechStart === null || level >= quiet) return false;
    quietSince ??= at;
    if (at - speechStart - (at - quietSince) < minSpeechMs) return false;
    if (at - quietSince < silenceMs) return false;
    done = true;
    return true;
  };
}
