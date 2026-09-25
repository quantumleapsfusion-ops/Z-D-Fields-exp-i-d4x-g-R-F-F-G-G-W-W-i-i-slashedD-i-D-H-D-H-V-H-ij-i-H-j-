import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { resolveShare } from '@/lib/voice/share';
import { getStorage, VOICE_BUCKET } from '@/lib/storage';

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
    select: { audioKey: true },
  });
  if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const url = await getStorage().signedUrl(VOICE_BUCKET, segment.audioKey, 60 * 15);
  return NextResponse.redirect(url, {
    status: 302,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
