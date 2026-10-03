import "server-only";

import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth/session";

import {
  MATCH_DISTANCE,
  type Voiceprint,
  VOICEPRINT_MODEL_VERSION,
  blend,
  distance,
  isVoiceprint,
} from "./voiceprint";

type LoginContext = { clientHash: string; device: string | null; enrol?: boolean };

async function remember(userId: string, sample: Voiceprint) {
  const stored = await prisma.voiceprint.findUnique({
    where: { userId },
    select: { print: true, samples: true },
  });
  if (!stored) {
    await prisma.voiceprint.create({
      data: { userId, print: sample, samples: 1, modelVersion: VOICEPRINT_MODEL_VERSION },
    });
    return;
  }
  await prisma.voiceprint.update({
    where: { userId },
    data: {
      print: isVoiceprint(stored.print)
        ? blend(stored.print, sample, stored.samples)
        : sample,
      samples: { increment: 1 },
      modelVersion: VOICEPRINT_MODEL_VERSION,
    },
  });
}

async function recordLogin(userId: string, context: LoginContext, success: boolean = true) {
  await prisma.loginEvent.create({
    data: {
      userId,
      method: "voice",
      success,
      clientHash: context.clientHash,
      device: context.device,
    },
  });
}

/**
 * Whether `sample` is the voice of `userId`. A match refines the stored print; a different voice
 * leaves it untouched. A user with no print yet claims this voice as theirs.
 */
export async function verifySpeaker(
  userId: string,
  sample: Voiceprint,
): Promise<boolean> {
  const stored = await prisma.voiceprint.findUnique({
    where: { userId },
    select: { print: true },
  });
  if (
    stored &&
    isVoiceprint(stored.print) &&
    distance(stored.print, sample) > MATCH_DISTANCE
  ) {
    return false;
  }
  await remember(userId, sample);
  return true;
}

/**
 * The voice is the key: signed in, it is checked against the speaker's print; signed out, the
 * closest matching speaker is signed in, and an unheard voice is given a stream of its own.
 */
export async function identifyVoice(
  sample: Voiceprint,
  currentUserId: string | null,
  context: LoginContext,
) {
  if (currentUserId) {
    const matched = await verifySpeaker(currentUserId, sample);
    await recordLogin(currentUserId, context, matched);
    return { userId: currentUserId, enrolled: false, matched };
  }

  const prints = await prisma.voiceprint.findMany({
    select: { userId: true, print: true, samples: true },
  });
  let closest: {
    userId: string;
    print: Voiceprint;
    samples: number;
    distance: number;
  } | null = null;
  for (const stored of prints) {
    const d = distance(stored.print, sample);
    if (d <= MATCH_DISTANCE && (!closest || d < closest.distance)) {
      closest = { ...stored, distance: d };
    }
  }

  if (closest) {
    await remember(closest.userId, sample);
    await createSession(closest.userId);
    await recordLogin(closest.userId, context);
    return { userId: closest.userId, enrolled: false, matched: true };
  }

  if (!context.enrol) {
    return { userId: null, enrolled: false, matched: false };
  }

  const user = await prisma.user.create({
    data: {
      voiceprint: {
        create: {
          print: sample,
          samples: 1,
          modelVersion: VOICEPRINT_MODEL_VERSION,
        },
      },
    },
    select: { id: true },
  });
  await createSession(user.id);
  await recordLogin(user.id, context);
  return { userId: user.id, enrolled: true, matched: true };
}
