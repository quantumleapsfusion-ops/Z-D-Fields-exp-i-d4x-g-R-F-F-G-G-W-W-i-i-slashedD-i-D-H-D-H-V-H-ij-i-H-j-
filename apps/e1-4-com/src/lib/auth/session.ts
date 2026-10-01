import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth/routes";

export { SESSION_COOKIE } from "@/lib/auth/routes";

const SESSION_SECONDS = 30 * 24 * 60 * 60;
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_SECONDS,
  };
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(now.getTime() + SESSION_SECONDS * 1000),
      lastSeenAt: now,
    },
  });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions());
}

export const currentSessionUserId = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const now = new Date();
  const tokenHash = hashToken(token);
  const session = await prisma.session.findFirst({
    where: { tokenHash, expiresAt: { gt: now } },
    select: { userId: true, lastSeenAt: true },
  });
  if (!session) return null;

  if (now.getTime() - session.lastSeenAt.getTime() > RENEW_AFTER_MS) {
    await prisma.session.update({
      where: { tokenHash },
      data: {
        lastSeenAt: now,
        expiresAt: new Date(now.getTime() + SESSION_SECONDS * 1000),
      },
    });
    try {
      cookieStore.set(SESSION_COOKIE, token, cookieOptions());
    } catch {
      // Server components can read cookies but cannot write them.
    }
  }

  return session.userId;
});

/** Ends every session of `userId` except the one making this request. */
export async function revokeOtherSessions(userId: string): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await prisma.session.deleteMany({
    where: {
      userId,
      ...(token ? { NOT: { tokenHash: hashToken(token) } } : {}),
    },
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  try {
    if (token)
      await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  } finally {
    cookieStore.delete(SESSION_COOKIE);
  }
}
