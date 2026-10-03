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

/** Wraps mono 16-bit PCM in a WAV header so the same samples can be transcribed. */
function pcmToWav(pcm: ArrayBuffer): Blob {
  const header = new DataView(new ArrayBuffer(44));
  const text = (at: number, value: string) =>
    [...value].forEach((c, i) => header.setUint8(at + i, c.charCodeAt(0)));
  text(0, "RIFF");
  header.setUint32(4, 36 + pcm.byteLength, true);
  text(8, "WAVEfmt ");
  header.setUint32(16, 16, true);
  header.setUint16(20, 1, true);
  header.setUint16(22, 1, true);
  header.setUint32(24, VOICEPRINT_SAMPLE_RATE, true);
  header.setUint32(28, VOICEPRINT_SAMPLE_RATE * 2, true);
  header.setUint16(32, 2, true);
  header.setUint16(34, 16, true);
  text(36, "data");
  header.setUint32(40, pcm.byteLength, true);
  return new Blob([header.buffer, pcm], { type: "audio/wav" });
}

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
 * Multipart body: `voice` is mono 16 kHz 16-bit little-endian PCM from the microphone. The same
 * samples become the voiceprint and are transcribed to check the digits named by `challenge`, so
 * the voice that is matched is the voice that said them. `enrol` asks for a new stream when no
 * known voice matches; without it an unmatched voice is refused.
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
  const challenge = form?.get("challenge");
  const enrol = form?.get("enrol") === "1";

  const samples = await voice.arrayBuffer();
  const print = voiceprint(pcm16ToFloat(samples), VOICEPRINT_SAMPLE_RATE);
  if (!print) {
    await recordLogin(hash, false, device);
    return refuse("voice", 422);
  }

  const live = await verifyLiveness(
    typeof challenge === "string" ? challenge : null,
    pcmToWav(samples),
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
      enrol,
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
