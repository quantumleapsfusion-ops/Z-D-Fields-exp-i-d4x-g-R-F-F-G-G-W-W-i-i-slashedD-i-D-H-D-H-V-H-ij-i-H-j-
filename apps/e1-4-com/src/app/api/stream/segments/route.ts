import { after, NextResponse } from "next/server";

import { getUserId } from "@/lib/auth/user";
import {
  appendSegment,
  listSegments,
  MAX_SEGMENT_BYTES,
  toSegmentDTO,
  transcribeSegment,
} from "@/lib/voice/stream";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ segments: await listSegments(userId) });
}

export async function POST(request: Request) {
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

  const segment = await appendSegment({
    userId,
    audio: new Uint8Array(await audio.arrayBuffer()),
    mimeType: (audio.type || "audio/webm").split(";")[0],
    durationMs,
    startedAt,
    endedAt,
  });

  if (segment.transcriptionStatus === "PENDING")
    after(() => transcribeSegment(segment.id));

  return NextResponse.json({ segment: toSegmentDTO(segment) }, { status: 201 });
}
