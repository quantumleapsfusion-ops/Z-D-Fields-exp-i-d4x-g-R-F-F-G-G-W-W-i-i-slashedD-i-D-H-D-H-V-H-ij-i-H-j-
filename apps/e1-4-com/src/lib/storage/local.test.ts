import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LocalStorageProvider } from "./local";

let root = "";
let storage: LocalStorageProvider;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "e14-storage-"));
  storage = new LocalStorageProvider(root);
});
afterEach(() => rm(root, { recursive: true, force: true }));

describe("LocalStorageProvider", () => {
  it("stores an object and gives it back with its content type", async () => {
    await storage.upload({
      bucket: "voice",
      path: "u1/s1/a.webm",
      body: new Uint8Array([1, 2, 3]),
      contentType: "audio/webm",
    });
    const blob = await storage.download("voice", "u1/s1/a.webm");
    expect(blob.type).toBe("audio/webm");
    expect(new Uint8Array(await blob.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("refuses to overwrite unless asked, like a real bucket", async () => {
    const input = {
      bucket: "avatars" as const,
      path: "u1/avatar.png",
      body: new Uint8Array([9]),
      contentType: "image/png",
    };
    await storage.upload(input);
    await expect(storage.upload(input)).rejects.toThrow(/already exists/);
    await storage.upload({ ...input, body: new Uint8Array([8]), upsert: true });
    expect(
      new Uint8Array(
        await (await storage.download("avatars", "u1/avatar.png")).arrayBuffer(),
      ),
    ).toEqual(new Uint8Array([8]));
  });

  it("lists every object under a prefix, folders included, and removes the whole prefix", async () => {
    for (const p of [
      "u1/s1/a.webm",
      "u1/s1/b.webm",
      "u1/talk/c/d.webm",
      "u2/s9/e.webm",
    ]) {
      await storage.upload({
        bucket: "voice",
        path: p,
        body: new Uint8Array([0]),
        contentType: "audio/webm",
      });
    }
    expect(await storage.listAll("voice", "u1")).toEqual([
      "u1/s1/a.webm",
      "u1/s1/b.webm",
      "u1/talk/c/d.webm",
    ]);
    expect(await storage.removePrefix("voice", "u1")).toBe(3);
    expect(await storage.listAll("voice", "u1")).toEqual([]);
    expect(await storage.listAll("voice", "u2")).toEqual(["u2/s9/e.webm"]);
    expect(await storage.listAll("voice", "nobody")).toEqual([]);
  });

  it("removes single objects and ignores ones that are already gone", async () => {
    await storage.upload({
      bucket: "voice",
      path: "u1/s1/a.webm",
      body: new Uint8Array([0]),
      contentType: "audio/webm",
    });
    await storage.remove("voice", ["u1/s1/a.webm", "u1/s1/missing.webm"]);
    expect(await storage.listAll("voice", "u1")).toEqual([]);
  });

  it("serves objects from the local route and never leaves the bucket folder", async () => {
    expect(storage.getPublicUrl("avatars", "u1/my avatar.png")).toBe(
      "/api/local-storage/avatars/u1/my%20avatar.png",
    );
    await expect(storage.download("voice", "../avatars/u1/avatar.png")).rejects.toThrow(
      /escapes bucket/,
    );
    await expect(
      storage.upload({
        bucket: "voice",
        path: "../../etc/passwd",
        body: new Uint8Array([0]),
        contentType: "text/plain",
      }),
    ).rejects.toThrow(/escapes bucket/);
  });
});

describe("serverEnv with the local provider", () => {
  it("hands out the database URL without demanding the Supabase key", async () => {
    const { serverEnv } = await import("@/lib/env");
    const previous = process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "";
    process.env.DATABASE_URL = "postgresql://postgres@localhost:5432/e14";
    try {
      expect(serverEnv().databaseUrl).toBe("postgresql://postgres@localhost:5432/e14");
      expect(() => serverEnv().supabaseServiceRoleKey).toThrow(
        /SUPABASE_SERVICE_ROLE_KEY/,
      );
    } finally {
      process.env.SUPABASE_SERVICE_ROLE_KEY = previous;
    }
  });
});
