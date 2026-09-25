import { notFound } from 'next/navigation';

import { PageShell } from '@/components/PageShell';
import { prisma } from '@/lib/db';
import { resolveShare } from '@/lib/voice/share';
import { toSegmentDTO } from '@/lib/voice/stream';

import { SharedStream } from './SharedStream';

export const metadata = { title: 'Shared voice', robots: { index: false } };

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const share = await resolveShare(token);
  if (!share) notFound();

  const [owner, segments] = await Promise.all([
    prisma.user.findUnique({ where: { id: share.userId }, select: { name: true } }),
    prisma.voiceSegment.findMany({
      where: share.segmentId
        ? { id: share.segmentId, stream: { userId: share.userId } }
        : { stream: { userId: share.userId } },
      orderBy: { index: 'asc' },
    }),
  ]);

  const dtos = segments
    .map(toSegmentDTO)
    .map((s) =>
      share.includeTranscript
        ? s
        : { ...s, transcription: null, transcriptionStatus: 'SKIPPED' as const },
    );

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <p className="label">Voice Stream</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          {owner?.name ?? 'An earthling'} shared{' '}
          {share.segmentId ? 'a moment of their stream' : 'their stream'}
        </h1>
        <SharedStream
          token={token}
          segments={dtos}
          includeAudio={share.includeAudio}
          includeTranscript={share.includeTranscript}
        />
      </section>
    </PageShell>
  );
}
