import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { toSegmentDTO, transcribeSegment } from "@/lib/voice/stream";

export const runtime = "nodejs";

/** Re-runs transcription for a segment (e.g. after a provider outage or adding an STT key). */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const owned = await prisma.voiceSegment.findFirst({
    where: { id, stream: { userId } },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.voiceSegment.update({
    where: { id },
    data: { transcriptionStatus: "PENDING" },
  });
  await transcribeSegment(id);
  const segment = await prisma.voiceSegment.findUniqueOrThrow({ where: { id } });
  return NextResponse.json({ segment: toSegmentDTO(segment) });
}
