import "server-only";

import { createHash } from "node:crypto";

import { prisma } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  averageEmbeddings,
  isUsablePhrase,
  isValidEmbedding,
  matchVoicePrint,
  mergeEmbedding,
  phraseKey,
} from "@/lib/voice/voiceprint";

/**
 * Voice identity. There are no emails or passwords: a person is their voice
 * name (what they say) plus their voice print (how they say it). Supabase Auth
 * is kept only as the cookie/session transport; the auth user carries an
 * internal placeholder address that is never shown or mailed.
 */

const PLACEHOLDER_DOMAIN = "voice.e1-4.com";
const MAX_ATTEMPTS = 6;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

export type VoiceAuthResult =
  | { ok: true; userId: string }
  | {
      ok: false;
      reason:
        | "bad-input"
        | "unknown-phrase"
        | "voice-mismatch"
        | "phrase-taken"
        | "too-many-attempts"
        | "session-failed";
      message: string;
    };

const attempts = new Map<string, { count: number; resetAt: number }>();

function throttled(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

export function hashPhrase(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** Signs the current browser in as `userId` by exchanging an admin-minted OTP hash for cookies. */
async function establishSession(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(userId);
  if (userErr || !userRes.user?.email) return false;

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: userRes.user.email,
  });
  if (error || !data.properties?.hashed_token) return false;

  const supabase = await createClient();
  const { error: otpErr } = await supabase.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: "magiclink",
  });
  return !otpErr;
}

export async function verifyVoice(input: {
  phrase: string;
  embedding: unknown;
}): Promise<VoiceAuthResult> {
  const key = phraseKey(input.phrase);
  if (!isUsablePhrase(key) || !isValidEmbedding(input.embedding)) {
    return {
      ok: false,
      reason: "bad-input",
      message: "Say your voice name clearly — two or more words.",
    };
  }
  const hash = hashPhrase(key);
  if (throttled(hash)) {
    return {
      ok: false,
      reason: "too-many-attempts",
      message: "Too many tries for that voice name. Rest a few minutes.",
    };
  }

  const prints = await prisma.voicePrint.findMany({
    where: { phraseHash: hash },
    select: { id: true, userId: true, embedding: true, sampleCount: true },
  });
  if (prints.length === 0) {
    return {
      ok: false,
      reason: "unknown-phrase",
      message: `Nobody here goes by "${key}" yet.`,
    };
  }

  const hit = matchVoicePrint(
    input.embedding,
    prints.map((p) => ({ id: p.id, embedding: p.embedding })),
  );
  if (!hit) {
    return {
      ok: false,
      reason: "voice-mismatch",
      message: "That voice name is known, but that isn't the voice we learned.",
    };
  }

  const print = prints.find((p) => p.id === hit.id)!;
  if (!(await establishSession(print.userId))) {
    return {
      ok: false,
      reason: "session-failed",
      message: "Recognised you, but couldn't open a session. Try again.",
    };
  }

  // Keep the print current: each successful verification nudges it toward today's voice.
  if (print.sampleCount < 50) {
    await prisma.voicePrint.update({
      where: { id: print.id },
      data: {
        embedding: mergeEmbedding(print.embedding, print.sampleCount, input.embedding),
        sampleCount: { increment: 1 },
      },
    });
  }
  attempts.delete(hash);
  return { ok: true, userId: print.userId };
}

export async function enrollVoice(input: {
  phrase: string;
  samples: unknown;
  displayName?: string;
}): Promise<VoiceAuthResult> {
  const key = phraseKey(input.phrase);
  const samples = Array.isArray(input.samples) ? input.samples : [];
  if (!isUsablePhrase(key) || samples.length < 2 || !samples.every(isValidEmbedding)) {
    return {
      ok: false,
      reason: "bad-input",
      message: "Enrolment needs a two-word voice name spoken at least twice.",
    };
  }
  const hash = hashPhrase(key);
  const embedding = averageEmbeddings(samples);

  const existing = await prisma.voicePrint.findMany({
    where: { phraseHash: hash },
    select: { id: true, userId: true, embedding: true },
  });
  if (existing.length > 0) {
    const same = matchVoicePrint(
      embedding,
      existing.map((p) => ({ id: p.userId, embedding: p.embedding })),
    );
    if (same) {
      // Same person re-enrolling: just let them in.
      return (await establishSession(same.id))
        ? { ok: true, userId: same.id }
        : {
            ok: false,
            reason: "session-failed",
            message: "Couldn't open a session. Try again.",
          };
    }
    return {
      ok: false,
      reason: "phrase-taken",
      message: `"${key}" already belongs to another voice. Choose a different voice name.`,
    };
  }

  const admin = createAdminClient();
  const displayName = input.displayName?.trim().slice(0, 80) || titleCase(key);
  const { data, error } = await admin.auth.admin.createUser({
    email: `${crypto.randomUUID()}@${PLACEHOLDER_DOMAIN}`,
    email_confirm: true,
    user_metadata: { identity: "voice", name: displayName },
  });
  if (error || !data.user) {
    return {
      ok: false,
      reason: "session-failed",
      message: "Couldn't create your account. Try again.",
    };
  }
  const userId = data.user.id;

  await prisma.user.upsert({
    where: { id: userId },
    update: { displayName },
    create: { id: userId, displayName },
  });
  await prisma.voicePrint.create({
    data: {
      userId,
      phrase: key,
      phraseHash: hash,
      embedding,
      sampleCount: samples.length,
    },
  });

  if (!(await establishSession(userId))) {
    return {
      ok: false,
      reason: "session-failed",
      message: "Enrolled, but couldn't open a session. Say your voice name again.",
    };
  }
  return { ok: true, userId };
}

function titleCase(key: string): string {
  return key.replace(/\b\w/g, (c) => c.toUpperCase());
}
