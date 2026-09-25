import 'server-only';

import { SupabaseStorage } from './supabase';
import type { ObjectStorage } from './types';

export type { Bucket, ObjectStorage } from './types';
export { AVATARS_BUCKET, VOICE_BUCKET } from './types';

let instance: ObjectStorage | undefined;

export function getStorage(): ObjectStorage {
  instance ??= new SupabaseStorage();
  return instance;
}

/**
 * Every object a user owns lives under `<uid>/` in its bucket, so hard-delete can purge a user
 * with one prefix sweep per bucket, and Storage RLS can key on the first path segment.
 */
export const userPrefix = (userId: string) => `${userId}/`;

export const storageKeys = {
  /** `voice` bucket */
  segment: (userId: string, segmentId: string, ext: string) =>
    `${userPrefix(userId)}segments/${segmentId}.${ext}`,
  /** `avatars` bucket */
  avatar: (userId: string, ext: string) => `${userPrefix(userId)}avatar/${Date.now()}.${ext}`,
};
