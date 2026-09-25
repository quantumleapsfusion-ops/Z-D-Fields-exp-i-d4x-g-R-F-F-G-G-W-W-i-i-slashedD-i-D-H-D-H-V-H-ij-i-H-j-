export const AVATARS_BUCKET = "avatars";
export const VOICE_BUCKET = "voice";

export type StorageBucket = typeof AVATARS_BUCKET | typeof VOICE_BUCKET;

export interface UploadInput {
  bucket: StorageBucket;
  /** Object path inside the bucket. Convention: first segment is the owner's uid. */
  path: string;
  body: Blob | ArrayBuffer | Uint8Array | File;
  contentType: string;
  /** Overwrite an existing object at the same path. */
  upsert?: boolean;
}

/**
 * Minimal provider-agnostic storage surface. Implementations decide how
 * public vs private buckets are exposed (public URL vs signed URL).
 */
export interface StorageProvider {
  upload(input: UploadInput): Promise<{ path: string }>;
  /** Permanent URL for objects in a public bucket. */
  getPublicUrl(bucket: StorageBucket, path: string): string;
  /** Time-limited URL for objects in a private bucket. */
  getSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresInSeconds?: number,
  ): Promise<string>;
  download(bucket: StorageBucket, path: string): Promise<Blob>;
  remove(bucket: StorageBucket, paths: string[]): Promise<void>;
  /** Recursively list object paths under a prefix (e.g. a user's uid). */
  listAll(bucket: StorageBucket, prefix: string): Promise<string[]>;
  /** Delete every object under a prefix. */
  removePrefix(bucket: StorageBucket, prefix: string): Promise<number>;
}
