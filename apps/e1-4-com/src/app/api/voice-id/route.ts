import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

import { withRuntimeEnv } from "@/lib/api/handler";
import { getUserId } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { identifyVoice } from "@/lib/voiceprint/identity";
import { verifyLiveness } from "@/lib/voiceprint/liveness";
import { isVoiceIdRateLimited } from "@/lib/voiceprint/rate-limit";
import {
  VOICEPRINT_SAMPLE_RATE,
  pcm16ToFloat,
  voiceprint,
} from "@/lib/voiceprint/voiceprint";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = VOICEPRINT_SAMPLE_RATE * 2 * 15;
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

/**
 * Why a sign-in did not go through. The page never shows words; it answers each reason with its
 * own shake, glyph and vibration.
 */
type Reason = "voice" | "liveness" | "busy" | "setup";

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
    data: { userId, method: "voice", success, clientHash: hash, device },
  });
}

function refuse(reason: Reason, status: number) {
  return NextResponse.json({ ok: false, reason }, { status });
}

/**
 * Multipart body: `voice` is mono 16 kHz 16-bit little-endian PCM measured on the device (the
 * voice itself is the credential); `audio` and `challenge` prove the person is live by speaking
 * back the digits the device said.
 */
async function handlePOST(request: Request) {
  const hash = clientHash(request);
  const device = request.headers.get("user-agent")?.slice(0, 200) || null;
  if (await rateLimited(hash)) return refuse("busy", 429);

  const form = await request.formData().catch(() => null);
  const voice = form?.get("voice");
  if (!(voice instanceof Blob) || voice.size === 0 || voice.size > MAX_BYTES) {
    return refuse("voice", 413);
  }
  const audio = form?.get("audio");
  const challenge = form?.get("challenge");

  const print = voiceprint(
    pcm16ToFloat(await voice.arrayBuffer()),
    VOICEPRINT_SAMPLE_RATE,
  );
  if (!print) {
    await recordLogin(hash, false, device);
    return refuse("voice", 422);
  }

  const live = await verifyLiveness(
    typeof challenge === "string" ? challenge : null,
    audio instanceof Blob && audio.size <= MAX_AUDIO_BYTES ? audio : null,
  );
  if (live !== "ok") {
    await recordLogin(hash, false, device);
    return refuse(
      live === "failed" ? "liveness" : "setup",
      live === "failed" ? 401 : 503,
    );
  }

  let currentUserId: string | null = null;
  try {
    currentUserId = await getUserId();
    const { enrolled, matched } = await identifyVoice(print, currentUserId, {
      clientHash: hash,
      device,
    });
    if (!matched) return refuse("voice", 401);
    return NextResponse.json({ ok: true, enrolled, matched });
  } catch (err) {
    await recordLogin(hash, false, device, currentUserId ?? undefined).catch(() => null);
    console.error("voice-id failed", err);
    throw err;
  }
}

export const POST = withRuntimeEnv(handlePOST);
