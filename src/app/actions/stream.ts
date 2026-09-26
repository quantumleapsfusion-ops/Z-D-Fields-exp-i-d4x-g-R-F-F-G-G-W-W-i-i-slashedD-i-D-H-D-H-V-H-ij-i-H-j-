"use server";

import { revalidatePath } from "next/cache";

import { getUserId } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { hardDeleteSegment, hardDeleteStream } from "@/lib/privacy/hard-delete";
import { newShareToken } from "@/lib/voice/share";

async function authed(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

export async function deleteSegmentAction(segmentId: string): Promise<{ ok: boolean }> {
  const userId = await authed();
  const ok = await hardDeleteSegment(userId, segmentId);
  revalidatePath("/stream");
  return { ok };
}

export async function deleteStreamAction(): Promise<{ deleted: number }> {
  const userId = await authed();
  const deleted = await hardDeleteStream(userId);
  revalidatePath("/stream");
  return { deleted };
}

export type ShareOptions = {
  segmentId: string | null;
  includeAudio: boolean;
  includeTranscript: boolean;
};

export async function createShareAction(
  options: ShareOptions,
): Promise<{ token: string }> {
  const userId = await authed();
  if (!options.includeAudio && !options.includeTranscript) {
    throw new Error("A share must include audio or transcript");
  }
  if (options.segmentId) {
    const owned = await prisma.voiceSegment.findFirst({
      where: { id: options.segmentId, stream: { userId } },
      select: { id: true },
    });
    if (!owned) throw new Error("Segment not found");
  }
  const share = await prisma.share.create({
    data: {
      token: newShareToken(),
      userId,
      segmentId: options.segmentId,
      includeAudio: options.includeAudio,
      includeTranscript: options.includeTranscript,
    },
  });
  revalidatePath("/profile");
  return { token: share.token };
}

export async function revokeShareAction(shareId: string): Promise<void> {
  const userId = await authed();
  await prisma.share.updateMany({
    where: { id: shareId, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/profile");
}
