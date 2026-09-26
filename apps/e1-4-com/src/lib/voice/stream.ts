import type { VoiceSegment } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { VOICE_BUCKET, storage } from "@/lib/storage";
import { getTranscriber } from "@/lib/stt";

export const MAX_SEGMENT_BYTES = 50 * 1024 * 1024;

export type SegmentDTO = {
  id: string;
  index: number;
  durationMs: number;
  startedAt: string;
  endedAt: string;
  mimeType: string;
  transcription: string | null;
  transcriptionStatus: VoiceSegment["transcriptionStatus"];
};

export function toSegmentDTO(s: VoiceSegment): SegmentDTO {
  return {
    id: s.id,
    index: s.index,
    durationMs: s.durationMs,
    startedAt: s.startedAt.toISOString(),
    endedAt: s.endedAt.toISOString(),
    mimeType: s.mimeType,
    transcription: s.transcription,
    transcriptionStatus: s.transcriptionStatus,
  };
}

export async function getOrCreateStream(userId: string) {
  return prisma.voiceStream.upsert({ where: { userId }, update: {}, create: { userId } });
}

export async function listSegments(userId: string): Promise<SegmentDTO[]> {
  const segments = await prisma.voiceSegment.findMany({
    where: { stream: { userId } },
    orderBy: { index: "asc" },
  });
  return segments.map(toSegmentDTO);
}

function extensionFor(mimeType: string): string {
  if (mimeType.includes("mp4") || mimeType.includes("aac")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

type AppendInput = {
  userId: string;
  audio: Uint8Array;
  mimeType: string;
  durationMs: number;
  startedAt: Date;
  endedAt: Date;
};

/**
 * Appends one captured span to the user's single running stream. The blob is written before the
 * row is committed so a segment row never points at missing audio.
 */
export async function appendSegment(input: AppendInput): Promise<VoiceSegment> {
  const stream = await getOrCreateStream(input.userId);
  const transcriber = getTranscriber();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const last = await prisma.voiceSegment.findFirst({
      where: { streamId: stream.id },
      orderBy: { index: "desc" },
      select: { index: true },
    });
    const index = (last?.index ?? -1) + 1;
    const id = crypto.randomUUID();
    // Path convention required by the Storage RLS policies: <uid>/<streamId>/<file>.
    const audioPath = `${input.userId}/${stream.id}/${id}.${extensionFor(input.mimeType)}`;

    await storage.upload({
      bucket: VOICE_BUCKET,
      path: audioPath,
      body: input.audio,
      contentType: input.mimeType,
    });
    try {
      const segment = await prisma.voiceSegment.create({
        data: {
          id,
          streamId: stream.id,
          index,
          audioPath,
          mimeType: input.mimeType,
          sizeBytes: input.audio.byteLength,
          durationMs: Math.max(0, Math.round(input.durationMs)),
          startedAt: input.startedAt,
          endedAt: input.endedAt,
          transcriptionStatus: transcriber ? "PENDING" : "SKIPPED",
        },
      });
      await prisma.voiceStream.update({
        where: { id: stream.id },
        data: { updatedAt: new Date() },
      });
      return segment;
    } catch (error) {
      await storage.remove(VOICE_BUCKET, [audioPath]);
      // Unique (streamId, index) collision from a concurrent upload: retry with the next index.
      if ((error as { code?: string }).code === "P2002" && attempt < 2) continue;
      throw error;
    }
  }
  throw new Error("Could not allocate a segment index");
}

/** Runs speech-to-text for one segment and stores the text on the row. */
export async function transcribeSegment(segmentId: string): Promise<void> {
  const transcriber = getTranscriber();
  if (!transcriber) {
    await prisma.voiceSegment.update({
      where: { id: segmentId },
      data: { transcriptionStatus: "SKIPPED" },
    });
    return;
  }
  const segment = await prisma.voiceSegment.findUnique({ where: { id: segmentId } });
  if (!segment) return;
  try {
    const blob = await storage.download(VOICE_BUCKET, segment.audioPath);
    const body = new Uint8Array(await blob.arrayBuffer());
    const { text } = await transcriber.transcribe(body, segment.mimeType);
    await prisma.voiceSegment.update({
      where: { id: segmentId },
      data: {
        transcription: text,
        transcriptionStatus: "DONE",
        transcriptionError: null,
      },
    });
  } catch (error) {
    console.error(`[voice] transcription failed for ${segmentId}`, error);
    await prisma.voiceSegment.update({
      where: { id: segmentId },
      data: {
        transcriptionStatus: "FAILED",
        transcriptionError:
          error instanceof Error ? error.message.slice(0, 500) : "Unknown error",
      },
    });
  }
}

/** Downloads a segment's audio from the private `voice` bucket. */
export async function readSegmentAudio(audioPath: string): Promise<Uint8Array> {
  const blob = await storage.download(VOICE_BUCKET, audioPath);
  return new Uint8Array(await blob.arrayBuffer());
}

export function audioResponse(body: Uint8Array, contentType: string): Response {
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
