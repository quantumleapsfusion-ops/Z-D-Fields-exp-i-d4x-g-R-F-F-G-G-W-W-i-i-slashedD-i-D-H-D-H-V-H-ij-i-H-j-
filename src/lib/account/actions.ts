"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AVATARS_BUCKET, storage } from "@/lib/storage";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { hardDeleteUser } from "./delete";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const AVATAR_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Ensures a profile row exists for the signed-in user (the DB trigger normally does this). */
export async function ensureProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  return db.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email ?? null,
      displayName:
        (user.user_metadata.full_name as string | undefined) ??
        (user.user_metadata.name as string | undefined) ??
        null,
    },
  });
}

export async function updateDisplayName(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (displayName.length > 80) {
    redirect("/profile?error=" + encodeURIComponent("Name is too long."));
  }
  await db.user.update({
    where: { id: user.id },
    data: { displayName: displayName || null },
  });
  revalidatePath("/profile");
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image first." };
  }
  if (file.size > MAX_AVATAR_BYTES)
    return { ok: false, error: "Image must be under 5 MB." };
  const ext = AVATAR_TYPES[file.type];
  if (!ext) return { ok: false, error: "Use a PNG, JPEG, WebP or GIF." };

  const path = `${user.id}/avatar.${ext}`;
  const previous = await db.user.findUnique({
    where: { id: user.id },
    select: { avatarPath: true },
  });

  await storage.upload({
    bucket: AVATARS_BUCKET,
    path,
    body: file,
    contentType: file.type,
    upsert: true,
  });
  await db.user.update({ where: { id: user.id }, data: { avatarPath: path } });

  if (previous?.avatarPath && previous.avatarPath !== path) {
    await storage.remove(AVATARS_BUCKET, [previous.avatarPath]);
  }

  revalidatePath("/profile");
  return { ok: true };
}

export async function removeAvatar(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: { avatarPath: true },
  });
  if (profile?.avatarPath) {
    await storage.remove(AVATARS_BUCKET, [profile.avatarPath]);
    await db.user.update({ where: { id: user.id }, data: { avatarPath: null } });
  }
  revalidatePath("/profile");
  return { ok: true };
}

/** Hard-deletes the signed-in user's account, then signs them out. */
export async function deleteMyAccount(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (formData.get("confirm") !== "DELETE") {
    redirect("/profile?error=" + encodeURIComponent("Type DELETE to confirm."));
  }

  await hardDeleteUser(user.id);

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
