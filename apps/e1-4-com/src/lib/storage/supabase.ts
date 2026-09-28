import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StorageBucket, StorageProvider, UploadInput } from "./types";

const LIST_PAGE_SIZE = 1000;

/**
 * Supabase Storage implementation. Uses the service-role client so it can
 * operate on any object; callers are responsible for authorization (the
 * Server Actions that use it always scope paths to the signed-in uid).
 */
export class SupabaseStorageProvider implements StorageProvider {
  private client: SupabaseClient | null = null;

  private get supabase() {
    this.client ??= createAdminClient();
    return this.client;
  }

  async upload({ bucket, path, body, contentType, upsert = false }: UploadInput) {
    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(path, body, { contentType, upsert });
    if (error) throw new Error(`storage.upload(${bucket}/${path}): ${error.message}`);
    return { path };
  }

  getPublicUrl(bucket: StorageBucket, path: string) {
    return this.supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async getSignedUrl(bucket: StorageBucket, path: string, expiresInSeconds = 60 * 60) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);
    if (error)
      throw new Error(`storage.getSignedUrl(${bucket}/${path}): ${error.message}`);
    return data.signedUrl;
  }

  async download(bucket: StorageBucket, path: string) {
    const { data, error } = await this.supabase.storage.from(bucket).download(path);
    if (error) throw new Error(`storage.download(${bucket}/${path}): ${error.message}`);
    return data;
  }

  async remove(bucket: StorageBucket, paths: string[]) {
    if (paths.length === 0) return;
    const { error } = await this.supabase.storage.from(bucket).remove(paths);
    if (error) throw new Error(`storage.remove(${bucket}): ${error.message}`);
  }

  async listAll(bucket: StorageBucket, prefix: string) {
    const out: string[] = [];
    const walk = async (dir: string) => {
      let offset = 0;
      for (;;) {
        const { data, error } = await this.supabase.storage
          .from(bucket)
          .list(dir, { limit: LIST_PAGE_SIZE, offset });
        if (error) throw new Error(`storage.list(${bucket}/${dir}): ${error.message}`);
        if (!data || data.length === 0) break;
        for (const entry of data) {
          const full = dir ? `${dir}/${entry.name}` : entry.name;
          // Folders come back with a null id in Supabase Storage listings.
          if (entry.id === null) await walk(full);
          else out.push(full);
        }
        if (data.length < LIST_PAGE_SIZE) break;
        offset += LIST_PAGE_SIZE;
      }
    };
    await walk(prefix);
    return out;
  }

  async removePrefix(bucket: StorageBucket, prefix: string) {
    const paths = await this.listAll(bucket, prefix);
    for (let i = 0; i < paths.length; i += LIST_PAGE_SIZE) {
      await this.remove(bucket, paths.slice(i, i + LIST_PAGE_SIZE));
    }
    return paths.length;
  }
}
