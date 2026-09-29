import "server-only";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

import { CHALLENGE_TTL_MS, makePhrase } from "./challenge";
import { openProfile, parseProfileKey, sealProfile } from "./seal";

function profileKey(): Buffer {
  const key = env.voiceId.profileKey;
  if (!key) throw new Error("VOICE_PROFILE_KEY is not set");
  return parseProfileKey(key);
}

export async function createChallenge() {
  const now = new Date();
  await db.voiceChallenge.deleteMany({ where: { expiresAt: { lt: now } } });
  return db.voiceChallenge.create({
    data: { phrase: makePhrase(), expiresAt: new Date(now.getTime() + CHALLENGE_TTL_MS) },
    select: { id: true, phrase: true, expiresAt: true },
  });
}

/** Deletes the challenge and returns its phrase if it was still valid. Each phrase works once. */
export async function consumeChallenge(id: string): Promise<string | null> {
  const challenge = await db.voiceChallenge.findUnique({ where: { id } });
  if (!challenge) return null;
  const { count } = await db.voiceChallenge.deleteMany({ where: { id } });
  return count === 1 && challenge.expiresAt > new Date() ? challenge.phrase : null;
}

export async function loadVoiceprints(): Promise<{
  userIds: string[];
  profiles: Uint8Array[];
}> {
  const key = profileKey();
  const rows = await db.voiceProfile.findMany({
    select: { userId: true, profile: true },
  });
  return {
    userIds: rows.map((r) => r.userId),
    profiles: rows.map((r) => openProfile(r.profile, key)),
  };
}

export async function saveVoiceprint(
  userId: string,
  engine: string,
  profile: Uint8Array,
) {
  const sealed = sealProfile(profile, profileKey());
  await db.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
  await db.voiceProfile.upsert({
    where: { userId },
    update: { engine, profile: sealed },
    create: { userId, engine, profile: sealed },
  });
}
