"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUserId } from "@/lib/auth/user";
import { endSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { IMAGE_EXTENSIONS, sniffImageType } from "@/lib/images/sniff";
import { AVATARS_BUCKET, storage } from "@/lib/storage";

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
  if (file.size > MAX_AVATAR_BYTES) return { ok: false, message: "Max 4 MB." };
  // Trust the bytes, not the declared type: a renamed script or an SVG is refused here.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) return { ok: false, message: "Use PNG, JPEG, WebP or GIF." };
  const ext = IMAGE_EXTENSIONS[type];

  // Storage RLS: first path segment must be the owner's uid.
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const previous = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPath: true },
  });

  await storage.upload({
    bucket: AVATARS_BUCKET,
    path,
    body: bytes,
    contentType: type,
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

const DELETION_DELAY_DAYS = 30;

/** Schedules account deletion (30-day cool-off period). */
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

  const now = new Date();
  const scheduledFor = new Date(now.getTime() + DELETION_DELAY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      deletionScheduledAt: now,
      deletionScheduledFor: scheduledFor,
    },
  });

  await endSession();
  redirect("/?deletion-scheduled=1");
}

/** Cancels a scheduled deletion. */
export async function cancelDeletion(): Promise<ActionState> {
  const userId = await authed();
  await prisma.user.update({
    where: { id: userId },
    data: {
      deletionScheduledAt: null,
      deletionScheduledFor: null,
    },
  });
  revalidatePath("/profile");
  return { ok: true, message: "Deletion cancelled. Your account is safe." };
}
