import { after, NextResponse } from "next/server";

import { getUserId } from "@/lib/auth/user";
import { appendNote, toNoteDTO, transcribeNote } from "@/lib/talk/conversations";
import { MAX_SEGMENT_BYTES } from "@/lib/voice/stream";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Sends a voice note, or one clip of a live stream when `liveId` is set. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: conversationId } = await params;

  const form = await request.formData();
  const audio = form.get("audio");
  const startedAt = new Date(String(form.get("startedAt")));
  const endedAt = new Date(String(form.get("endedAt")));
  const durationMs = Number(form.get("durationMs"));
  const liveId = form.get("liveId") ? String(form.get("liveId")) : null;

  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "Missing audio" }, { status: 400 });
  }
  if (audio.size > MAX_SEGMENT_BYTES) {
    return NextResponse.json({ error: "Note too large" }, { status: 413 });
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
  if (liveId && !UUID.test(liveId)) {
    return NextResponse.json({ error: "Invalid liveId" }, { status: 400 });
  }

  const note = await appendNote({
    userId,
    conversationId,
    liveId,
    audio: new Uint8Array(await audio.arrayBuffer()),
    mimeType: (audio.type || "audio/webm").split(";")[0],
    durationMs,
    startedAt,
    endedAt,
  });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (note.transcriptionStatus === "PENDING") after(() => transcribeNote(note.id));

  return NextResponse.json({ note: toNoteDTO(note) }, { status: 201 });
}
