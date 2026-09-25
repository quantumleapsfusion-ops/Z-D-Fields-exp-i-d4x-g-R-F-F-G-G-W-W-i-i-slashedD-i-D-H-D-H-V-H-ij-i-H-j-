import 'server-only';

import { prisma } from '@/lib/db';
import { AVATARS_BUCKET, getStorage, userPrefix, VOICE_BUCKET } from '@/lib/storage';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Hard-delete routine (GDPR Art. 17 / CCPA §1798.105).
 *
 * Storage objects are purged first: if that fails we abort before touching the database, so no
 * row is ever deleted while its blob survives (the rows still hold the paths needed to retry).
 * Every user-owned table cascades from `User` (streams, segments, shares, boards). Finally the
 * Supabase Auth user is removed so the identity cannot be re-linked to deleted data.
 */
export async function hardDeleteUser(userId: string): Promise<{ objectsDeleted: number }> {
  const storage = getStorage();
  const segments = await prisma.voiceSegment.findMany({
    where: { stream: { userId } },
    select: { audioKey: true },
  });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarKey: true } });

  // Delete explicit paths first (covers objects written outside the prefix), then sweep the prefix.
  await Promise.all(segments.map((s) => storage.delete(VOICE_BUCKET, s.audioKey)));
  if (user?.avatarKey) await storage.delete(AVATARS_BUCKET, user.avatarKey);
  const [voiceSwept, avatarsSwept] = await Promise.all([
    storage.deletePrefix(VOICE_BUCKET, userPrefix(userId)),
    storage.deletePrefix(AVATARS_BUCKET, userPrefix(userId)),
  ]);

  await prisma.user.deleteMany({ where: { id: userId } });

  const { error } = await createAdminClient().auth.admin.deleteUser(userId);
  if (error && error.status !== 404) {
    throw new Error(`auth.admin.deleteUser(${userId}): ${error.message}`);
  }

  const explicit = segments.length + (user?.avatarKey ? 1 : 0);
  return { objectsDeleted: Math.max(explicit, voiceSwept + avatarsSwept) };
}

/** Destroys one Voice Stream segment: its audio blob, its row, and any shares pointing at it. */
export async function hardDeleteSegment(userId: string, segmentId: string): Promise<boolean> {
  const segment = await prisma.voiceSegment.findFirst({
    where: { id: segmentId, stream: { userId } },
    select: { id: true, audioKey: true },
  });
  if (!segment) return false;
  await getStorage().delete(VOICE_BUCKET, segment.audioKey);
  await prisma.voiceSegment.delete({ where: { id: segment.id } });
  return true;
}

/**
 * "Destroy all my voice data": every segment blob, transcript, and share link (whole-stream and
 * per-segment) goes; the account, name and avatar stay.
 */
export async function hardDeleteStream(userId: string): Promise<number> {
  const segments = await prisma.voiceSegment.findMany({
    where: { stream: { userId } },
    select: { audioKey: true },
  });
  const storage = getStorage();
  await Promise.all(segments.map((s) => storage.delete(VOICE_BUCKET, s.audioKey)));
  await storage.deletePrefix(VOICE_BUCKET, userPrefix(userId));
  await prisma.$transaction([
    prisma.share.deleteMany({ where: { userId } }),
    prisma.voiceStream.deleteMany({ where: { userId } }),
  ]);
  return segments.length;
}

/** Everything we hold about a user, for data-portability requests (GDPR Art. 20). */
export async function exportUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      avatarKey: true,
      createdAt: true,
      stream: {
        select: {
          id: true,
          createdAt: true,
          segments: {
            orderBy: { index: 'asc' },
            select: {
              id: true,
              index: true,
              audioKey: true,
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
      shares: { select: { token: true, segmentId: true, createdAt: true, revokedAt: true } },
      boards: { select: { id: true, title: true, data: true, createdAt: true, updatedAt: true } },
    },
  });
}
