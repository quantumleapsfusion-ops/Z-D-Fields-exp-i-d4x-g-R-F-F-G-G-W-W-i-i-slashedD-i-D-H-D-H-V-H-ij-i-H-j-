import { NextResponse } from 'next/server';

import { getUserId } from '@/lib/auth';
import { getLiveTranscriptionConfig } from '@/lib/stt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Tells the browser how to run live transcription. Paid Deepgram tokens are only minted for
 * signed-in users; everyone else gets the free browser Web Speech API.
 */
export async function GET() {
  const userId = await getUserId().catch(() => null);
  if (!userId) return NextResponse.json({ provider: 'browser' });
  return NextResponse.json(await getLiveTranscriptionConfig());
}
