/** Minimal object-storage contract used for audio blobs and avatars. */
export interface ObjectStorage {
  readonly driver: string;
  put(key: string, body: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<{ body: Uint8Array; contentType: string } | null>;
  delete(key: string): Promise<void>;
  /** Deletes every object whose key starts with `prefix`. Returns the number of objects removed. */
  deletePrefix(prefix: string): Promise<number>;
}
