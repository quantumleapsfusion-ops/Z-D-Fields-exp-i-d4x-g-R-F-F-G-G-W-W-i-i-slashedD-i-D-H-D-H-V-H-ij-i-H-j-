import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { ObjectStorage } from './types';

/** Filesystem storage for local development. Content types are kept in a sidecar file. */
export class LocalStorage implements ObjectStorage {
  readonly driver = 'local';
  private readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  private resolve(key: string): string {
    const full = path.resolve(this.root, key);
    if (full !== this.root && !full.startsWith(this.root + path.sep)) {
      throw new Error(`Invalid storage key: ${key}`);
    }
    return full;
  }

  async put(key: string, body: Uint8Array, contentType: string): Promise<void> {
    const file = this.resolve(key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body);
    await fs.writeFile(`${file}.meta`, contentType);
  }

  async get(key: string) {
    const file = this.resolve(key);
    try {
      const [body, contentType] = await Promise.all([
        fs.readFile(file),
        fs.readFile(`${file}.meta`, 'utf8').catch(() => 'application/octet-stream'),
      ]);
      return { body: new Uint8Array(body), contentType };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    const file = this.resolve(key);
    await fs.rm(file, { force: true });
    await fs.rm(`${file}.meta`, { force: true });
  }

  async deletePrefix(prefix: string): Promise<number> {
    const dir = this.resolve(prefix);
    let count = 0;
    const walk = async (target: string) => {
      const entries = await fs.readdir(target, { withFileTypes: true }).catch(() => []);
      for (const entry of entries) {
        const child = path.join(target, entry.name);
        if (entry.isDirectory()) await walk(child);
        else if (!entry.name.endsWith('.meta')) count += 1;
      }
    };
    await walk(dir);
    await fs.rm(dir, { recursive: true, force: true });
    return count;
  }
}
