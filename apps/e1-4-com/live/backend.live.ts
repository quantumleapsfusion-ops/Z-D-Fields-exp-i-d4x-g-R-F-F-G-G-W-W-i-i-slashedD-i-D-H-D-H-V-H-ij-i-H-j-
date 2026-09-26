/**
 * Live backend pass against the real Supabase project. Not part of `npm test`.
 * Run: npx vitest run -c live.vitest.config.ts
 */
import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db";
import { publicEnv, serverEnv } from "@/lib/env";
import { hardDeleteUser } from "@/lib/privacy/hard-delete";
import { AVATARS_BUCKET, VOICE_BUCKET, storage } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { newShareToken, resolveShare } from "@/lib/voice/share";

const url = publicEnv.supabaseUrl;
const anon = publicEnv.supabaseAnonKey;
const admin = createAdminClient();
const stamp = Date.now();
const password = `E2e!${stamp}pass`;

type Actor = { id: string; email: string; jwt: string };
const actors: Actor[] = [];
let voicePath = "";
let shareToken = "";

async function makeActor(tag: string): Promise<Actor> {
  const email = `devin-e2e-${tag}-${stamp}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`createUser: ${error?.message}`);
  const client = createClient(url, anon, { auth: { persistSession: false } });
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.error || !signIn.data.session)
    throw new Error(`signIn: ${signIn.error?.message}`);
  const actor = { id: data.user.id, email, jwt: signIn.data.session.access_token };
  actors.push(actor);
  return actor;
}

function asUser(jwt: string) {
  return createClient(url, anon, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

let a: Actor;
let b: Actor;

beforeAll(async () => {
  a = await makeActor("a");
  b = await makeActor("b");
});

afterAll(async () => {
  for (const actor of actors) {
    await admin.auth.admin.deleteUser(actor.id).catch(() => undefined);
  }
  // No FK from public.users -> auth.users, so admin deletes leave profile rows behind.
  await prisma.user.deleteMany({ where: { id: { in: actors.map((x) => x.id) } } });
  await prisma.$disconnect();
});

describe("auth trigger", () => {
  it("creates public.users rows for new auth users", async () => {
    const rows = await prisma.user.findMany({ where: { id: { in: [a.id, b.id] } } });
    expect(rows.map((r) => r.id).sort()).toEqual([a.id, b.id].sort());
  });

  it("users RLS: a user sees only their own row", async () => {
    const { data, error } = await asUser(a.jwt).from("users").select("id");
    expect(error).toBeNull();
    expect(data?.map((r) => r.id)).toEqual([a.id]);
  });
});

describe("avatars bucket", () => {
  it("owner can upload under own uid; object is publicly readable", async () => {
    const path = `${a.id}/avatar.png`;
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64",
    );
    const up = await asUser(a.jwt).storage.from(AVATARS_BUCKET).upload(path, png, {
      contentType: "image/png",
      upsert: true,
    });
    expect(up.error).toBeNull();
    const publicUrl = storage.getPublicUrl(AVATARS_BUCKET, path);
    const res = await fetch(publicUrl);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("another user cannot write into someone else's avatar folder", async () => {
    const up = await asUser(b.jwt)
      .storage.from(AVATARS_BUCKET)
      .upload(`${a.id}/evil.png`, Buffer.from("x"), { contentType: "image/png" });
    expect(up.error).not.toBeNull();
  });
});

describe("voice stream + voice bucket", () => {
  it("owner can create stream, upload audio; other users are locked out", async () => {
    const own = asUser(a.jwt);
    const ins = await own
      .from("voice_streams")
      .insert({ id: randomUUID(), user_id: a.id, updated_at: new Date().toISOString() })
      .select("id")
      .single();
    expect(ins.error).toBeNull();
    const streamId = ins.data!.id as string;

    voicePath = `${a.id}/${streamId}/seg-1.webm`;
    const up = await own.storage
      .from(VOICE_BUCKET)
      .upload(voicePath, Buffer.from("webm-bytes"), { contentType: "audio/webm" });
    expect(up.error).toBeNull();

    const seg = await own
      .from("voice_segments")
      .insert({
        id: randomUUID(),
        stream_id: streamId,
        index: 0,
        audio_path: voicePath,
        mime_type: "audio/webm",
        size_bytes: 9,
        duration_ms: 1000,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    expect(seg.error).toBeNull();

    const other = asUser(b.jwt);
    const otherStreams = await other.from("voice_streams").select("id");
    expect(otherStreams.data).toEqual([]);
    const otherSegs = await other.from("voice_segments").select("id");
    expect(otherSegs.data).toEqual([]);
    const otherDl = await other.storage.from(VOICE_BUCKET).download(voicePath);
    expect(otherDl.error).not.toBeNull();
    const anonDl = await createClient(url, anon)
      .storage.from(VOICE_BUCKET)
      .download(voicePath);
    expect(anonDl.error).not.toBeNull();
    const publicRes = await fetch(
      `${url}/storage/v1/object/public/${VOICE_BUCKET}/${voicePath}`,
    );
    expect(publicRes.status).toBeGreaterThanOrEqual(400);

    const ownDl = await own.storage.from(VOICE_BUCKET).download(voicePath);
    expect(ownDl.error).toBeNull();
  });
});

describe("share by link", () => {
  it("share token resolves; segment reachable server-side; anon RLS hides the share row", async () => {
    shareToken = newShareToken();
    await prisma.share.create({
      data: { token: shareToken, userId: a.id, segmentId: null },
    });
    const share = await resolveShare(shareToken);
    expect(share?.userId).toBe(a.id);
    const segs = await prisma.voiceSegment.findMany({
      where: { stream: { userId: a.id } },
    });
    expect(segs).toHaveLength(1);
    const anonRows = await createClient(url, anon).from("shares").select("token");
    expect(anonRows.data).toEqual([]);
  });

  it("public share page renders logged out; revoked share 404s", async () => {
    const base = process.env.LIVE_BASE_URL;
    if (!base) return;
    const ok = await fetch(`${base}/s/${shareToken}`);
    expect(ok.status).toBe(200);
    expect(await ok.text()).toContain("shared");
    await prisma.share.update({
      where: { token: shareToken },
      data: { revokedAt: new Date() },
    });
    const gone = await fetch(`${base}/s/${shareToken}`);
    expect(gone.status).toBe(404);
    const protectedRoute = await fetch(`${base}/stream`, { redirect: "manual" });
    expect(protectedRoute.status).toBeGreaterThanOrEqual(300);
  });
});

describe("hardDeleteUser", () => {
  it("removes storage, db rows and the auth user", async () => {
    const result = await hardDeleteUser(a.id);
    expect(result).toMatchObject({ dbRowsRemoved: true, authUserRemoved: true });
    expect(result.objectsDeleted).toBe(2);

    expect(await storage.listAll(VOICE_BUCKET, a.id)).toEqual([]);
    expect(await storage.listAll(AVATARS_BUCKET, a.id)).toEqual([]);
    expect(await prisma.user.findUnique({ where: { id: a.id } })).toBeNull();
    expect(await prisma.voiceStream.findMany({ where: { userId: a.id } })).toEqual([]);
    expect(await prisma.share.findMany({ where: { userId: a.id } })).toEqual([]);
    const { data } = await admin.auth.admin.getUserById(a.id);
    expect(data.user ?? null).toBeNull();
    expect(serverEnv().databaseUrl).toBeTruthy();
  });
});
