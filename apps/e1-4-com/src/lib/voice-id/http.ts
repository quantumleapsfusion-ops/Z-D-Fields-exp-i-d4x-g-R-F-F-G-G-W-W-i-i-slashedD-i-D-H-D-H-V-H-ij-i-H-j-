import "server-only";

import { NextResponse } from "next/server";

import { VOICE_SAMPLE_RATE, int16FromBytes } from "./pcm";
import { voiceIdStatus } from "./status";

export const MIN_SIGN_IN_SECONDS = 1.5;
export const MIN_ENROLL_SECONDS = 6;
export const MAX_SECONDS = 60;

export type VoiceIdError =
  | "voice_id_unavailable"
  | "bad_audio"
  | "challenge_expired"
  | "phrase_mismatch"
  | "voice_not_recognised"
  | "need_more_speech"
  | "voice_already_known";

export function voiceIdError(error: VoiceIdError, status: number, extra: object = {}) {
  return NextResponse.json({ error, ...extra }, { status });
}

/** 503 response when this deployment can't do voice ID, else null. */
export function unavailable() {
  const status = voiceIdStatus();
  return status.available
    ? null
    : voiceIdError("voice_id_unavailable", 503, { reason: status.reason });
}

/** Reads the posted 16 kHz PCM body, or null if it is missing, malformed or out of bounds. */
export async function readPcm(
  request: Request,
  minSeconds: number,
): Promise<Int16Array | null> {
  if (request.headers.get("content-type") !== "application/octet-stream") return null;
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_SECONDS * VOICE_SAMPLE_RATE * 2) return null;
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength % 2 !== 0) return null;
  const seconds = bytes.byteLength / 2 / VOICE_SAMPLE_RATE;
  if (seconds < minSeconds || seconds > MAX_SECONDS) return null;
  return int16FromBytes(bytes);
}
