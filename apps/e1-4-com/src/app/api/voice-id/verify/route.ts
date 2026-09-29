import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { getTranscriber } from "@/lib/stt";
import { phraseMatches } from "@/lib/voice-id/challenge";
import { getSpeakerEngine } from "@/lib/voice-id/engine";
import {
  MIN_SIGN_IN_SECONDS,
  readPcm,
  unavailable,
  voiceIdError,
} from "@/lib/voice-id/http";
import { bestMatch } from "@/lib/voice-id/match";
import { wavFromPcm } from "@/lib/voice-id/pcm";
import { startSessionFor } from "@/lib/voice-id/session";
import { consumeChallenge, loadVoiceprints } from "@/lib/voice-id/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Voice sign-in. Body: 16 kHz mono PCM of the user saying the challenge phrase
 * (`?challenge=<id>`). Passes only if the phrase was said AND the voice matches one enrolled
 * voiceprint; then the response carries the Supabase session cookies.
 */
export async function POST(request: NextRequest) {
  const off = unavailable();
  if (off) return off;

  const challengeId = request.nextUrl.searchParams.get("challenge");
  const phrase = challengeId ? await consumeChallenge(challengeId) : null;
  if (!phrase) return voiceIdError("challenge_expired", 410);

  const pcm = await readPcm(request, MIN_SIGN_IN_SECONDS);
  if (!pcm) return voiceIdError("bad_audio", 400);

  const transcriber = getTranscriber();
  if (transcriber) {
    const { text } = await transcriber.transcribe(wavFromPcm(pcm), "audio/wav");
    if (!phraseMatches(phrase, text))
      return voiceIdError("phrase_mismatch", 401, { heard: text });
  } else if (env.voiceId.requirePhraseCheck) {
    return voiceIdError("voice_id_unavailable", 503);
  }

  const engine = getSpeakerEngine();
  if (!engine) return voiceIdError("voice_id_unavailable", 503);
  const { userIds, profiles } = await loadVoiceprints();
  const match = bestMatch(userIds, engine.score(pcm, profiles), env.voiceId.threshold);
  if (!match) return voiceIdError("voice_not_recognised", 401);

  await startSessionFor(match.userId);
  return NextResponse.json({ ok: true });
}
