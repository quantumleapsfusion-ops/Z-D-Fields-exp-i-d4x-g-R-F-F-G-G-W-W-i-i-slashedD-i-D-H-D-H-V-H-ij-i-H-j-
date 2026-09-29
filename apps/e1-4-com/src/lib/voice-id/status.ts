import "server-only";

import { env } from "@/lib/env";
import { getTranscriber } from "@/lib/stt";

export type VoiceIdStatus =
  { available: true; phraseCheck: boolean } | { available: false; reason: string };

/** Whether this deployment can sign people in by voice, and why not when it can't. */
export function voiceIdStatus(): VoiceIdStatus {
  const { picovoiceKey, profileKey, requirePhraseCheck } = env.voiceId;
  if (!picovoiceKey)
    return { available: false, reason: "PICOVOICE_ACCESS_KEY is not set" };
  if (!profileKey) return { available: false, reason: "VOICE_PROFILE_KEY is not set" };
  const phraseCheck = getTranscriber() !== null;
  if (requirePhraseCheck && !phraseCheck) {
    return {
      available: false,
      reason:
        "the spoken-phrase check needs a speech-to-text key (DEEPGRAM_API_KEY or OPENAI_API_KEY)",
    };
  }
  return { available: true, phraseCheck };
}
