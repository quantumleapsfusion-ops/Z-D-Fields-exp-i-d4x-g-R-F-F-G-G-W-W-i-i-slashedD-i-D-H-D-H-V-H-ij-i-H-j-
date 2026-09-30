import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

import { getUserId } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { identifyVoice } from "@/lib/voiceprint/identity";
import { isVoiceIdRateLimited } from "@/lib/voiceprint/rate-limit";
import {
  VOICEPRINT_SAMPLE_RATE,
  pcm16ToFloat,
  voiceprint,
} from "@/lib/voiceprint/voiceprint";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = VOICEPRINT_SAMPLE_RATE * 2 * 15;

function clientHash(request: Request): string {
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(address).digest("hex");
}

async function rateLimited(hash: string): Promise<boolean> {
  const now = Date.now();
  const [attempts, failures] = await Promise.all([
    prisma.loginEvent.count({
      where: { clientHash: hash, at: { gte: new Date(now - 60_000) } },
    }),
    prisma.loginEvent.count({
      where: {
        clientHash: hash,
        success: false,
        at: { gte: new Date(now - 15 * 60_000) },
      },
    }),
  ]);
  return isVoiceIdRateLimited(attempts, failures);
}

async function recordLogin(
  hash: string,
  success: boolean,
  device: string | null,
  userId?: string,
) {
  await prisma.loginEvent.create({
    data: {
      userId,
      method: "voice",
      success,
      clientHash: hash,
      device,
    },
  });
}

/** Body: mono 16 kHz 16-bit little-endian PCM. The voice itself is the credential. */
export async function POST(request: Request) {
  const hash = clientHash(request);
  const device = request.headers.get("user-agent")?.slice(0, 200) || null;
  if (await rateLimited(hash)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }
  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Too long" }, { status: 413 });
  }
  const print = voiceprint(pcm16ToFloat(body), VOICEPRINT_SAMPLE_RATE);
  if (!print) {
    await recordLogin(hash, false, device);
    return NextResponse.json({ error: "No voice" }, { status: 422 });
  }

  let currentUserId: string | null = null;
  try {
    currentUserId = await getUserId();
    const { enrolled, matched } = await identifyVoice(print, currentUserId, {
      clientHash: hash,
      device,
    });
    return NextResponse.json({ ok: true, enrolled, matched });
  } catch (err) {
    await recordLogin(hash, false, device, currentUserId ?? undefined);
    console.error("voice-id failed", err);
    return NextResponse.json({ error: "Voice not recognised" }, { status: 500 });
  }
}
