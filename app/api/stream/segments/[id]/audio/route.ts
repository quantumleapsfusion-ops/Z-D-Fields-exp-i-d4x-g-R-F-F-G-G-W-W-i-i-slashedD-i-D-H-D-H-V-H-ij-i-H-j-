import { NextResponse } from 'next/server';

import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStorage, VOICE_BUCKET } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const segment = await prisma.voiceSegment.findFirst({
    where: { id, stream: { userId } },
    select: { audioKey: true },
  });
  if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // The `voice` bucket is private: hand the browser a short-lived signed URL (supports Range).
  const url = await getStorage().signedUrl(VOICE_BUCKET, segment.audioKey, 60 * 15);
  return NextResponse.redirect(url, {
    status: 302,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
