/** Supabase Storage buckets. Created by supabase/migrations/*_rls_and_storage.sql. */
export const VOICE_BUCKET = 'voice';
export const AVATARS_BUCKET = 'avatars';
export type Bucket = typeof VOICE_BUCKET | typeof AVATARS_BUCKET;

/** Minimal object-storage contract used for audio blobs and avatars. */
export interface ObjectStorage {
  readonly driver: string;
  put(bucket: Bucket, path: string, body: Uint8Array, contentType: string): Promise<void>;
  get(bucket: Bucket, path: string): Promise<{ body: Uint8Array; contentType: string } | null>;
  /** Time-limited URL for an object in a private bucket. */
  signedUrl(bucket: Bucket, path: string, expiresInSeconds?: number): Promise<string>;
  delete(bucket: Bucket, path: string): Promise<void>;
  /** Deletes every object whose path starts with `prefix`. Returns the number of objects removed. */
  deletePrefix(bucket: Bucket, prefix: string): Promise<number>;
}
