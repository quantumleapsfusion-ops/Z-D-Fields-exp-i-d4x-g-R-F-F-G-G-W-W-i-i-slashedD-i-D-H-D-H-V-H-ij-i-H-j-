import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createAdminClient } from '@/lib/supabase/admin';

import type { Bucket, ObjectStorage } from './types';

const LIST_PAGE_SIZE = 1000;

/**
 * Supabase Storage via the service-role client so it can operate on any object.
 * Callers are responsible for authorization: every path is scoped to the owner's uid
 * (`<uid>/...`) and the route/action checks the session before touching it.
 */
export class SupabaseStorage implements ObjectStorage {
  readonly driver = 'supabase';
  private client: SupabaseClient | null = null;

  private get supabase() {
    this.client ??= createAdminClient();
    return this.client;
  }

  async put(bucket: Bucket, path: string, body: Uint8Array, contentType: string) {
    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(path, body, { contentType, upsert: true });
    if (error) throw new Error(`storage.put(${bucket}/${path}): ${error.message}`);
  }

  async get(bucket: Bucket, path: string) {
    const { data, error } = await this.supabase.storage.from(bucket).download(path);
    if (error || !data) {
      if (error && /not found|404/i.test(error.message)) return null;
      throw new Error(`storage.get(${bucket}/${path}): ${error?.message ?? 'empty'}`);
    }
    return {
      body: new Uint8Array(await data.arrayBuffer()),
      contentType: data.type || 'application/octet-stream',
    };
  }

  async signedUrl(bucket: Bucket, path: string, expiresInSeconds = 60 * 15) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);
    if (error) throw new Error(`storage.signedUrl(${bucket}/${path}): ${error.message}`);
    return data.signedUrl;
  }

  async delete(bucket: Bucket, path: string) {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) throw new Error(`storage.delete(${bucket}/${path}): ${error.message}`);
  }

  async deletePrefix(bucket: Bucket, prefix: string) {
    const paths = await this.listAll(bucket, prefix.replace(/\/$/, ''));
    for (let i = 0; i < paths.length; i += LIST_PAGE_SIZE) {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove(paths.slice(i, i + LIST_PAGE_SIZE));
      if (error) throw new Error(`storage.deletePrefix(${bucket}/${prefix}): ${error.message}`);
    }
    return paths.length;
  }

  private async listAll(bucket: Bucket, dir: string): Promise<string[]> {
    const out: string[] = [];
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
        if (entry.id === null) out.push(...(await this.listAll(bucket, full)));
        else out.push(full);
      }
      if (data.length < LIST_PAGE_SIZE) break;
      offset += LIST_PAGE_SIZE;
    }
    return out;
  }
}
