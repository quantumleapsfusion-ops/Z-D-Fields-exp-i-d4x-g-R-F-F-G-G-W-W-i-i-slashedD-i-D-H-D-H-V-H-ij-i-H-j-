import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { resolveShare } from '@/lib/voice/share';
import { getStorage } from '@/lib/storage';
import { audioResponse } from '@/lib/voice/stream';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; segmentId: string }> },
) {
  const { token, segmentId } = await params;
  const share = await resolveShare(token);
  if (!share || !share.includeAudio) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (share.segmentId && share.segmentId !== segmentId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const segment = await prisma.voiceSegment.findFirst({
    where: { id: segmentId, stream: { userId: share.userId } },
    select: { audioKey: true, mimeType: true },
  });
  if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const blob = await getStorage().get(segment.audioKey);
  if (!blob) return NextResponse.json({ error: 'Audio missing' }, { status: 404 });
  return audioResponse(blob.body, segment.mimeType);
}
