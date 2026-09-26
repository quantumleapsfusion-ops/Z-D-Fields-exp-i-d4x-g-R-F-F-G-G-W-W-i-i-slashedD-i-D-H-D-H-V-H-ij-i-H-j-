"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUserId } from "@/lib/auth/user";
import { prisma } from "@/lib/db";
import { hardDeleteUser } from "@/lib/privacy/hard-delete";
import { AVATARS_BUCKET, storage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

const AVATAR_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

export type ActionState = { ok: boolean; message: string } | null;

async function authed(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

export async function updateName(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const userId = await authed();
  const name = String(form.get("name") ?? "")
    .trim()
    .slice(0, 80);
  await prisma.user.update({
    where: { id: userId },
    data: { displayName: name || null },
  });
  revalidatePath("/profile");
  return { ok: true, message: "Saved." };
}

export async function uploadAvatar(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const userId = await authed();
  const file = form.get("avatar");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, message: "Choose an image." };
  const ext = AVATAR_TYPES[file.type];
  if (!ext) return { ok: false, message: "Use PNG, JPEG, WebP or GIF." };
  if (file.size > MAX_AVATAR_BYTES) return { ok: false, message: "Max 4 MB." };

  // Storage RLS: first path segment must be the owner's uid.
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const previous = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPath: true },
  });

  await storage.upload({
    bucket: AVATARS_BUCKET,
    path,
    body: file,
    contentType: file.type,
    upsert: true,
  });
  await prisma.user.update({ where: { id: userId }, data: { avatarPath: path } });
  if (previous?.avatarPath && previous.avatarPath !== path) {
    await storage.remove(AVATARS_BUCKET, [previous.avatarPath]);
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Avatar updated." };
}

export async function removeAvatar(): Promise<void> {
  const userId = await authed();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPath: true },
  });
  if (user?.avatarPath) {
    await storage.remove(AVATARS_BUCKET, [user.avatarPath]);
    await prisma.user.update({ where: { id: userId }, data: { avatarPath: null } });
  }
  revalidatePath("/", "layout");
}

/** Permanently deletes the account, all audio, transcripts, boards, shares and stored blobs. */
export async function deleteAccount(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const userId = await authed();
  if (
    String(form.get("confirm") ?? "")
      .trim()
      .toUpperCase() !== "DELETE"
  ) {
    return { ok: false, message: "Type DELETE to confirm." };
  }
  await hardDeleteUser(userId);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
