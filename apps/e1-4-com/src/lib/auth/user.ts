import "server-only";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AVATARS_BUCKET, storage } from "@/lib/storage";
import { currentSessionUserId } from "@/lib/auth/session";

export interface SessionUser {
  id: string;
  name: string | null;
  image: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = await currentSessionUserId();
  if (!userId) return null;

  const profile = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.displayName,
    image: profile.avatarPath
      ? storage.getPublicUrl(AVATARS_BUCKET, profile.avatarPath)
      : null,
  };
}

export async function getUserId(): Promise<string | null> {
  return currentSessionUserId();
}

export async function requireUser(next: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
