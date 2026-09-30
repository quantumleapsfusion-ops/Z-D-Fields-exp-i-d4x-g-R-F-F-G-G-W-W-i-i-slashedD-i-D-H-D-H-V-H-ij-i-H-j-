import { after, NextResponse } from "next/server";

import { withRuntimeEnv } from "@/lib/api/handler";

import { getUserId } from "@/lib/auth/user";
import { verifySpeaker } from "@/lib/voiceprint/identity";
import {
  VOICEPRINT_SAMPLE_RATE,
  pcm16ToFloat,
  voiceprint,
} from "@/lib/voiceprint/voiceprint";
import {
  appendSegment,
  listSegments,
  MAX_SEGMENT_BYTES,
  toSegmentDTO,
  transcribeSegment,
} from "@/lib/voice/stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_VOICE_BYTES = VOICEPRINT_SAMPLE_RATE * 2 * 15;

/**
 * Optional `voice` part: mono 16 kHz 16-bit PCM of the same span, used to check that the entry
 * was spoken by the stream's owner. `null` when there is no usable sample or the check fails.
 */
async function speakerCheck(userId: string, voice: FormDataEntryValue | null) {
  if (!(voice instanceof Blob) || voice.size === 0 || voice.size > MAX_VOICE_BYTES) {
    return null;
  }
  const print = voiceprint(
    pcm16ToFloat(await voice.arrayBuffer()),
    VOICEPRINT_SAMPLE_RATE,
  );
  if (!print) return null;
  return verifySpeaker(userId, print).catch((error: unknown) => {
    console.error("[voice] speaker check failed", error);
    return null;
  });
}

async function handleGET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ segments: await listSegments(userId) });
}

async function handlePOST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const audio = form.get("audio");
  const startedAt = new Date(String(form.get("startedAt")));
  const endedAt = new Date(String(form.get("endedAt")));
  const durationMs = Number(form.get("durationMs"));

  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "Missing audio" }, { status: 400 });
  }
  if (audio.size > MAX_SEGMENT_BYTES) {
    return NextResponse.json({ error: "Segment too large" }, { status: 413 });
  }
  if (
    Number.isNaN(startedAt.getTime()) ||
    Number.isNaN(endedAt.getTime()) ||
    endedAt < startedAt
  ) {
    return NextResponse.json({ error: "Invalid timestamps" }, { status: 400 });
  }
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }

  const speakerVerified = await speakerCheck(userId, form.get("voice"));
  const segment = await appendSegment({
    userId,
    audio: new Uint8Array(await audio.arrayBuffer()),
    mimeType: (audio.type || "audio/webm").split(";")[0],
    durationMs,
    startedAt,
    endedAt,
    speakerVerified,
  });

  if (segment.transcriptionStatus === "PENDING")
    after(() => transcribeSegment(segment.id));

  return NextResponse.json({ segment: toSegmentDTO(segment) }, { status: 201 });
}

export const GET = withRuntimeEnv(handleGET);
export const POST = withRuntimeEnv(handlePOST);
