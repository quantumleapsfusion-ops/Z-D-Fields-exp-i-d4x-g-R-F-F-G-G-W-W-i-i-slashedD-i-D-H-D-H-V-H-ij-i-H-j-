import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { AVATARS_BUCKET, getStorage } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarKey: true } });
  if (!user?.avatarKey) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const blob = await getStorage().get(AVATARS_BUCKET, user.avatarKey);
  if (!blob) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return new Response(new Uint8Array(blob.body), {
    headers: { 'Content-Type': blob.contentType, 'Cache-Control': 'public, max-age=300' },
  });
}
