import "server-only";

import { prisma } from "@/lib/db";
import { AVATARS_BUCKET, VOICE_BUCKET, storage } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { leaveConversation } from "@/lib/talk/conversations";

export interface HardDeleteResult {
  userId: string;
  objectsDeleted: number;
  dbRowsRemoved: boolean;
  authUserRemoved: boolean;
}

/**
 * Hard-delete routine (GDPR Art. 17 / CCPA §1798.105).
 *
 *   1. Talk conversations the user was the last member of (with the other senders' audio)
 *   2. Storage objects under `<uid>/` in the `voice` and `avatars` buckets
 *      (Voice Stream segments and every Talk voice note the user sent)
 *   3. Postgres rows (User; streams/segments/shares/boards/usage/notes/memberships cascade)
 *   4. The Supabase Auth user itself
 *
 * Storage goes first so a failure there leaves the DB rows (and thus the paths
 * needed to retry) intact — no row is ever deleted while its blob survives.
 */
export async function hardDeleteUser(userId: string): Promise<HardDeleteResult> {
  // Leave every Talk conversation first: ones the user was last in are destroyed (with the other
  // senders' audio) while the user row still exists, so a failure here is retryable.
  const memberships = await prisma.conversationMember.findMany({
    where: { userId },
    select: { conversationId: true },
  });
  for (const { conversationId } of memberships) {
    await leaveConversation(userId, conversationId);
  }

  const [voiceRemoved, avatarsRemoved] = await Promise.all([
    storage.removePrefix(VOICE_BUCKET, userId),
    storage.removePrefix(AVATARS_BUCKET, userId),
  ]);

  const deleted = await prisma.user.deleteMany({ where: { id: userId } });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error && error.status !== 404) {
    throw new Error(`auth.admin.deleteUser(${userId}): ${error.message}`);
  }

  return {
    userId,
    objectsDeleted: voiceRemoved + avatarsRemoved,
    dbRowsRemoved: deleted.count > 0,
    authUserRemoved: !error,
  };
}

/** Destroys one Voice Stream segment: its audio blob, its row, and any shares pointing at it. */
export async function hardDeleteSegment(
  userId: string,
  segmentId: string,
): Promise<boolean> {
  const segment = await prisma.voiceSegment.findFirst({
    where: { id: segmentId, stream: { userId } },
    select: { id: true, audioPath: true },
  });
  if (!segment) return false;
  await storage.remove(VOICE_BUCKET, [segment.audioPath]);
  await prisma.voiceSegment.delete({ where: { id: segment.id } });
  return true;
}

/** Destroys the entire Voice Stream (all segments + blobs) but keeps the account. */
export async function hardDeleteStream(userId: string): Promise<number> {
  const segments = await prisma.voiceSegment.findMany({
    where: { stream: { userId } },
    select: { audioPath: true },
  });
  if (segments.length > 0) {
    await storage.remove(
      VOICE_BUCKET,
      segments.map((s) => s.audioPath),
    );
  }
  // Only the stream's folder: Talk notes also live under `<uid>/` and must survive.
  const stream = await prisma.voiceStream.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (stream) await storage.removePrefix(VOICE_BUCKET, `${userId}/${stream.id}`);
  await prisma.voiceStream.deleteMany({ where: { userId } });
  return segments.length;
}

/** Everything we hold about a user, for data-portability requests (GDPR Art. 20). */
export async function exportUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      email: true,
      avatarPath: true,
      createdAt: true,
      stream: {
        select: {
          id: true,
          createdAt: true,
          segments: {
            orderBy: { index: "asc" },
            select: {
              id: true,
              index: true,
              audioPath: true,
              mimeType: true,
              durationMs: true,
              startedAt: true,
              endedAt: true,
              transcription: true,
              transcriptionStatus: true,
            },
          },
        },
      },
      shares: {
        select: { token: true, segmentId: true, createdAt: true, revokedAt: true },
      },
      boards: {
        select: { id: true, title: true, data: true, createdAt: true, updatedAt: true },
      },
      memberships: {
        select: { conversationId: true, joinedAt: true, lastReadAt: true },
      },
      voiceNotes: {
        orderBy: { startedAt: "asc" },
        select: {
          id: true,
          conversationId: true,
          liveId: true,
          audioPath: true,
          mimeType: true,
          durationMs: true,
          startedAt: true,
          endedAt: true,
          transcription: true,
          transcriptionStatus: true,
        },
      },
      usageEvents: {
        select: { feature: true, tier: true, model: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
