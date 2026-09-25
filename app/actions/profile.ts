'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hardDeleteStream, hardDeleteUser } from '@/lib/privacy/hard-delete';
import { getStorage, storageKeys } from '@/lib/storage';

const AVATAR_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

export type ActionState = { ok: boolean; message: string } | null;

async function authed(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');
  return userId;
}

export async function destroyVoiceData(_prev: ActionState, form: FormData): Promise<ActionState> {
  const userId = await authed();
  if (String(form.get('confirm') ?? '').trim() !== 'DESTROY') {
    return { ok: false, message: 'Type DESTROY to confirm.' };
  }
  const deleted = await hardDeleteStream(userId);
  revalidatePath('/settings');
  revalidatePath('/stream');
  return {
    ok: true,
    message: `Destroyed ${deleted} segment${deleted === 1 ? '' : 's'}: audio, transcripts and share links are gone.`,
  };
}

export async function updateName(_prev: ActionState, form: FormData): Promise<ActionState> {
  const userId = await authed();
  const name = String(form.get('name') ?? '')
    .trim()
    .slice(0, 80);
  await prisma.user.update({ where: { id: userId }, data: { name: name || null } });
  revalidatePath('/settings');
  return { ok: true, message: 'Saved.' };
}

export async function uploadAvatar(_prev: ActionState, form: FormData): Promise<ActionState> {
  const userId = await authed();
  const file = form.get('avatar');
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: 'Choose an image.' };
  const ext = AVATAR_TYPES[file.type];
  if (!ext) return { ok: false, message: 'Use PNG, JPEG, WebP or GIF.' };
  if (file.size > MAX_AVATAR_BYTES) return { ok: false, message: 'Max 4 MB.' };

  const storage = getStorage();
  const key = storageKeys.avatar(userId, ext);
  await storage.put(key, new Uint8Array(await file.arrayBuffer()), file.type);

  const previous = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarKey: true },
  });
  await prisma.user.update({ where: { id: userId }, data: { avatarKey: key } });
  if (previous?.avatarKey) await storage.delete(previous.avatarKey);

  revalidatePath('/', 'layout');
  return { ok: true, message: 'Avatar updated.' };
}

export async function removeAvatar(): Promise<void> {
  const userId = await authed();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarKey: true } });
  if (user?.avatarKey) {
    await getStorage().delete(user.avatarKey);
    await prisma.user.update({ where: { id: userId }, data: { avatarKey: null } });
  }
  revalidatePath('/', 'layout');
}

/** Permanently deletes the account, all audio, transcripts, boards, shares and stored blobs. */
export async function deleteAccount(_prev: ActionState, form: FormData): Promise<ActionState> {
  const userId = await authed();
  if (
    String(form.get('confirm') ?? '')
      .trim()
      .toUpperCase() !== 'DELETE'
  ) {
    return { ok: false, message: 'Type DELETE to confirm.' };
  }
  await hardDeleteUser(userId);
  redirect('/api/auth/signout?callbackUrl=/');
}
