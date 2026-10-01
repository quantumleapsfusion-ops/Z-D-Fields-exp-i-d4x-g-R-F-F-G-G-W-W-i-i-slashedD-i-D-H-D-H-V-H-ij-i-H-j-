import "server-only";

import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import type { StorageBucket, StorageProvider, UploadInput } from "./types";

/** Sidecar that remembers an object's content type, so a download comes back as it went in. */
const TYPE_SUFFIX = ".content-type";

/** The URL prefix the local route serves objects from. */
export const LOCAL_STORAGE_ROUTE = "/api/local-storage";

/**
 * Objects as plain files on disk, for working on the app without a Supabase project: each bucket
 * is a folder under `root`, each object a file at its path. Only for development and tests;
 * a serverless deployment has no disk to keep them on.
 */
export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly root: string) {}

  /** Absolute path for an object, refusing anything that would escape the bucket folder. */
  private resolve(bucket: StorageBucket, objectPath: string): string {
    const bucketDir = path.resolve(this.root, bucket);
    const full = path.resolve(bucketDir, objectPath);
    if (full !== bucketDir && !full.startsWith(bucketDir + path.sep)) {
      throw new Error(`storage: path escapes bucket (${bucket}/${objectPath})`);
    }
    return full;
  }

  async upload({
    bucket,
    path: objectPath,
    body,
    contentType,
    upsert = false,
  }: UploadInput) {
    const file = this.resolve(bucket, objectPath);
    if (!upsert && (await exists(file))) {
      throw new Error(`storage.upload(${bucket}/${objectPath}): already exists`);
    }
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, await toBytes(body));
    await writeFile(file + TYPE_SUFFIX, contentType);
    return { path: objectPath };
  }

  getPublicUrl(bucket: StorageBucket, objectPath: string) {
    return `${LOCAL_STORAGE_ROUTE}/${bucket}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
  }

  async getSignedUrl(bucket: StorageBucket, objectPath: string) {
    // Nothing to sign on a developer's own disk; the route checks the session instead.
    return this.getPublicUrl(bucket, objectPath);
  }

  async download(bucket: StorageBucket, objectPath: string) {
    const file = this.resolve(bucket, objectPath);
    const [bytes, type] = await Promise.all([
      readFile(file),
      readFile(file + TYPE_SUFFIX, "utf8").catch(() => "application/octet-stream"),
    ]);
    return new Blob([new Uint8Array(bytes)], { type });
  }

  async remove(bucket: StorageBucket, paths: string[]) {
    for (const objectPath of paths) {
      const file = this.resolve(bucket, objectPath);
      await rm(file, { force: true });
      await rm(file + TYPE_SUFFIX, { force: true });
    }
  }

  async listAll(bucket: StorageBucket, prefix: string) {
    const dir = this.resolve(bucket, prefix);
    if (!(await exists(dir))) return [];
    const entries = await readdir(dir, { recursive: true, withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && !e.name.endsWith(TYPE_SUFFIX))
      .map((e) =>
        path
          .relative(this.resolve(bucket, ""), path.join(e.parentPath, e.name))
          .split(path.sep)
          .join("/"),
      )
      .sort();
  }

  async removePrefix(bucket: StorageBucket, prefix: string) {
    const objects = await this.listAll(bucket, prefix);
    await rm(this.resolve(bucket, prefix), { recursive: true, force: true });
    return objects.length;
  }
}

async function exists(file: string): Promise<boolean> {
  return stat(file).then(
    () => true,
    () => false,
  );
}

async function toBytes(body: UploadInput["body"]): Promise<Uint8Array> {
  if (body instanceof Uint8Array) return body;
  if (body instanceof ArrayBuffer) return new Uint8Array(body);
  return new Uint8Array(await body.arrayBuffer());
}
