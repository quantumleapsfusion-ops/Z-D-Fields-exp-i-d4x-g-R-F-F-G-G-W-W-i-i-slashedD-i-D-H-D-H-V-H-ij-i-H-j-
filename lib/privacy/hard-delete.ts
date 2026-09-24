import { prisma } from '@/lib/db';
import { getStorage, userPrefix } from '@/lib/storage';

/**
 * Hard-delete routine (GDPR Art. 17 / CCPA §1798.105).
 *
 * Storage objects are purged first: if that fails we abort before touching the database, so no
 * row is ever deleted while its blob survives. Every user-owned table cascades from `User`
 * (streams, segments, shares, boards, OAuth accounts, sessions).
 */
export async function hardDeleteUser(userId: string): Promise<{ objectsDeleted: number }> {
  const storage = getStorage();
  const segments = await prisma.voiceSegment.findMany({
    where: { stream: { userId } },
    select: { audioKey: true },
  });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarKey: true } });

  // Delete explicit keys (covers objects written outside the user prefix), then the whole prefix.
  const keys = [...segments.map((s) => s.audioKey), ...(user?.avatarKey ? [user.avatarKey] : [])];
  await Promise.all(keys.map((key) => storage.delete(key)));
  const swept = await storage.deletePrefix(userPrefix(userId));

  await prisma.user.delete({ where: { id: userId } });
  return { objectsDeleted: Math.max(keys.length, swept) };
}

/** Destroys one Voice Stream segment: its audio blob, its row, and any shares pointing at it. */
export async function hardDeleteSegment(userId: string, segmentId: string): Promise<boolean> {
  const segment = await prisma.voiceSegment.findFirst({
    where: { id: segmentId, stream: { userId } },
    select: { id: true, audioKey: true },
  });
  if (!segment) return false;
  await getStorage().delete(segment.audioKey);
  await prisma.voiceSegment.delete({ where: { id: segment.id } });
  return true;
}

/** Destroys the entire Voice Stream (all segments + blobs) but keeps the account. */
export async function hardDeleteStream(userId: string): Promise<number> {
  const segments = await prisma.voiceSegment.findMany({
    where: { stream: { userId } },
    select: { audioKey: true },
  });
  const storage = getStorage();
  await Promise.all(segments.map((s) => storage.delete(s.audioKey)));
  await storage.deletePrefix(`${userPrefix(userId)}segments/`);
  await prisma.voiceStream.deleteMany({ where: { userId } });
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
      accounts: { select: { provider: true, providerAccountId: true } },
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
