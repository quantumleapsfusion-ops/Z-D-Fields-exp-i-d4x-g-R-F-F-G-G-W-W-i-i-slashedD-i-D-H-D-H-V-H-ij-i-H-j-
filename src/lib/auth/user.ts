import "server-only";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AVATARS_BUCKET, storage } from "@/lib/storage";
import { getCurrentUser } from "@/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  /** Public avatar URL (Supabase Storage) or null. */
  image: string | null;
}

/**
 * The signed-in user's profile (Supabase Auth identity + `users` row), or null.
 * Creates the profile row if the auth trigger has not run yet.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const authUser = await getCurrentUser();
  if (!authUser) return null;

  const profile = await db.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: {
      id: authUser.id,
      email: authUser.email ?? null,
      displayName:
        (authUser.user_metadata.full_name as string | undefined) ??
        (authUser.user_metadata.name as string | undefined) ??
        null,
    },
  });

  const oauthPicture =
    (authUser.user_metadata.avatar_url as string | undefined) ??
    (authUser.user_metadata.picture as string | undefined) ??
    null;

  return {
    id: profile.id,
    email: profile.email,
    name: profile.displayName,
    image: profile.avatarPath
      ? storage.getPublicUrl(AVATARS_BUCKET, profile.avatarPath)
      : oauthPicture,
  };
}

/** Returns the signed-in user's id or `null`. */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/** For server components/actions that need a signed-in user; redirects to login otherwise. */
export async function requireUser(next: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
