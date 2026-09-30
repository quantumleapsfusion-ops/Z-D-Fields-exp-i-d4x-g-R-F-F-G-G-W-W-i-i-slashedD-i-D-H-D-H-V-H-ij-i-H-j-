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

/** Best-effort per-instance limit on attempts per client address. */
const ATTEMPTS_PER_MINUTE = 10;
const attempts = new Map<string, number[]>();

function tooManyAttempts(request: Request): boolean {
  const client =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (attempts.get(client) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  attempts.set(client, recent);
  if (attempts.size > 10_000) attempts.clear();
  return recent.length > ATTEMPTS_PER_MINUTE;
}

/** Body: mono 16 kHz 16-bit little-endian PCM. The voice itself is the credential. */
export async function POST(request: Request) {
  if (tooManyAttempts(request)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }
  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Too long" }, { status: 413 });
  }
  const print = voiceprint(pcm16ToFloat(body), VOICEPRINT_SAMPLE_RATE);
  if (!print) return NextResponse.json({ error: "No voice" }, { status: 422 });

  const current = await getCurrentUser().catch(() => null);
  try {
    const { enrolled, matched } = await identifyVoice(print, current);
    return NextResponse.json({ ok: true, enrolled, matched });
  } catch (err) {
    console.error("voice-id failed", err);
    return NextResponse.json({ error: "Voice not recognised" }, { status: 500 });
  }
}
