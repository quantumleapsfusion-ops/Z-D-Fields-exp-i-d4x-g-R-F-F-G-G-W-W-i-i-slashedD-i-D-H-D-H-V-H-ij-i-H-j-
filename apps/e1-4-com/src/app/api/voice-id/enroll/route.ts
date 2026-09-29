import { NextResponse, type NextRequest } from "next/server";

import { getUserId } from "@/lib/auth/user";
import { env } from "@/lib/env";
import { getSpeakerEngine } from "@/lib/voice-id/engine";
import {
  MIN_ENROLL_SECONDS,
  readPcm,
  unavailable,
  voiceIdError,
} from "@/lib/voice-id/http";
import { bestMatch } from "@/lib/voice-id/match";
import { createVoiceAccount, startSessionFor } from "@/lib/voice-id/session";
import { loadVoiceprints, saveVoiceprint } from "@/lib/voice-id/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Voice enrollment. Body: 16 kHz mono PCM of the user reading the enrollment lines.
 * Signed-in users (re)set their voiceprint; everyone else gets a new voice-only account and is
 * signed straight in. A voice that already belongs to another account is refused.
 */
export async function POST(request: NextRequest) {
  const off = unavailable();
  if (off) return off;

  const pcm = await readPcm(request, MIN_ENROLL_SECONDS);
  if (!pcm) return voiceIdError("bad_audio", 400);

  const engine = getSpeakerEngine();
  if (!engine) return voiceIdError("voice_id_unavailable", 503);
  const { percentage, profile } = engine.enroll(pcm);
  if (!profile) return voiceIdError("need_more_speech", 422, { percentage });

  const currentUserId = await getUserId().catch(() => null);
  const { userIds, profiles } = await loadVoiceprints();
  const match = bestMatch(userIds, engine.score(pcm, profiles), env.voiceId.threshold, 0);
  if (match && match.userId !== currentUserId)
    return voiceIdError("voice_already_known", 409);

  const userId = currentUserId ?? (await createVoiceAccount());
  await saveVoiceprint(userId, engine.name, profile);
  if (!currentUserId) await startSessionFor(userId);
  return NextResponse.json({ ok: true });
}
