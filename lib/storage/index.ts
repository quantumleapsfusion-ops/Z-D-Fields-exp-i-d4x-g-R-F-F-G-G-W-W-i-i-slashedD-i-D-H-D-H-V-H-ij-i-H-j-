import { env } from '@/lib/env';

import { LocalStorage } from './local';
import { S3Storage } from './s3';
import type { ObjectStorage } from './types';

export type { ObjectStorage } from './types';

let instance: ObjectStorage | undefined;

export function getStorage(): ObjectStorage {
  if (instance) return instance;
  const s = env.storage;
  if (s.driver === 's3') {
    if (!s.bucket || !s.accessKeyId || !s.secretAccessKey) {
      throw new Error(
        'STORAGE_DRIVER=s3 requires S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY',
      );
    }
    instance = new S3Storage({
      bucket: s.bucket,
      region: s.region,
      endpoint: s.endpoint,
      accessKeyId: s.accessKeyId,
      secretAccessKey: s.secretAccessKey,
      forcePathStyle: s.forcePathStyle,
    });
  } else {
    instance = new LocalStorage(s.localDir);
  }
  return instance;
}

/** All objects for a user live under this prefix so hard-delete can purge them in one sweep. */
export const userPrefix = (userId: string) => `users/${userId}/`;

export const storageKeys = {
  segment: (userId: string, segmentId: string, ext: string) =>
    `${userPrefix(userId)}segments/${segmentId}.${ext}`,
  avatar: (userId: string, ext: string) => `${userPrefix(userId)}avatar/${Date.now()}.${ext}`,
};
