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

type LoginContext = { clientHash: string; device: string | null };

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

async function recordLogin(userId: string, context: LoginContext) {
  await prisma.loginEvent.create({
    data: {
      userId,
      method: "voice",
      success: true,
      clientHash: context.clientHash,
      device: context.device,
    },
  });
}

export async function identifyVoice(
  sample: Voiceprint,
  currentUserId: string | null,
  context: LoginContext,
) {
  if (currentUserId) {
    await remember(currentUserId, sample);
    await recordLogin(currentUserId, context);
    return { userId: currentUserId, enrolled: false };
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
    return { userId: closest.userId, enrolled: false };
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
  return { userId: user.id, enrolled: true };
}
