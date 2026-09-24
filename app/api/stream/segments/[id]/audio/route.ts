import { NextResponse } from 'next/server';

import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStorage } from '@/lib/storage';
import { audioResponse } from '@/lib/voice/stream';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const segment = await prisma.voiceSegment.findFirst({
    where: { id, stream: { userId } },
    select: { audioKey: true, mimeType: true },
  });
  if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const blob = await getStorage().get(segment.audioKey);
  if (!blob) return NextResponse.json({ error: 'Audio missing' }, { status: 404 });
  return audioResponse(blob.body, segment.mimeType);
}
