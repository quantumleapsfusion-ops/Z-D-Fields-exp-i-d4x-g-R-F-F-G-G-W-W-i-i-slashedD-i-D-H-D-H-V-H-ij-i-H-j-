import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/supabase/server";
import { identifyVoice } from "@/lib/voiceprint/identity";
import {
  VOICEPRINT_SAMPLE_RATE,
  pcm16ToFloat,
  voiceprint,
} from "@/lib/voiceprint/voiceprint";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = VOICEPRINT_SAMPLE_RATE * 2 * 15;

/** Body: mono 16 kHz 16-bit little-endian PCM. The voice itself is the credential. */
export async function POST(request: Request) {
  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Too long" }, { status: 413 });
  }
  const print = voiceprint(pcm16ToFloat(body), VOICEPRINT_SAMPLE_RATE);
  if (!print) return NextResponse.json({ error: "No voice" }, { status: 422 });

  const current = await getCurrentUser().catch(() => null);
  try {
    const { enrolled } = await identifyVoice(print, current);
    return NextResponse.json({ ok: true, enrolled });
  } catch (err) {
    console.error("voice-id failed", err);
    return NextResponse.json({ error: "Voice not recognised" }, { status: 500 });
  }
}
