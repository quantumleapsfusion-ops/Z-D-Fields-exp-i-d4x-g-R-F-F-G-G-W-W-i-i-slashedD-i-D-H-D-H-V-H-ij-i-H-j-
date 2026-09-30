import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { hardDeleteUser } = await import("@/lib/privacy/hard-delete");
const { prisma } = await import("@/lib/db");
const { storage, AVATARS_BUCKET, VOICE_BUCKET } = await import("@/lib/storage");
const { createAdminClient } = await import("@/lib/supabase/admin");
const { appendSegment, listSegments } = await import("@/lib/voice/stream");
const { newShareToken, resolveShare } = await import("@/lib/voice/share");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const admin = createAdminClient();
const stamp = Date.now();

type TestUser = { id: string; email: string; password: string };
let owner: TestUser;
let other: TestUser;

async function createTestUser(tag: string): Promise<TestUser> {
  const email = `devin-live-${tag}-${stamp}@example.com`;
  const password = `Pw!${stamp}-${tag}-xyz`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `Devin ${tag}` },
  });
  if (error) throw error;
  return { id: data.user.id, email, password };
}

async function signedInClient(u: TestUser) {
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({
    email: u.email,
    password: u.password,
  });
  if (error) throw error;
  return c;
}

beforeAll(async () => {
  owner = await createTestUser("owner");
  other = await createTestUser("other");
});

afterAll(async () => {
  for (const u of [owner, other]) {
    if (!u) continue;
    await admin.auth.admin.deleteUser(u.id).catch(() => {});
    await prisma.user.deleteMany({ where: { id: u.id } }).catch(() => {});
  }
  await prisma.$disconnect();
});

describe("live supabase", () => {
  it("1. auth.users insert trigger creates the public.users profile row", async () => {
    const row = await prisma.user.findUnique({ where: { id: owner.id } });
    expect(row).not.toBeNull();
    expect(row!.email).toBe(owner.email);
    expect(row!.displayName).toBe("Devin owner");
  });

  it("2. avatar upload lands in `avatars` and is publicly readable", async () => {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64",
    );
    const path = `${owner.id}/avatar.png`;
    await storage.upload({
      bucket: AVATARS_BUCKET,
      path,
      body: png,
      contentType: "image/png",
      upsert: true,
    });
    const res = await fetch(storage.getPublicUrl(AVATARS_BUCKET, path));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
    expect(await storage.listAll(AVATARS_BUCKET, owner.id)).toContain(path);
  });

  it("3. voice segment is stored privately; only the owner can read it", async () => {
    const audio = new Uint8Array(2048).fill(1);
    const seg = await appendSegment({
      userId: owner.id,
      audio,
      mimeType: "audio/webm",
      durationMs: 1000,
      startedAt: new Date(),
      endedAt: new Date(),
    });
    console.log(`[3] transcriptionStatus after append: ${seg.transcriptionStatus}`);
    expect((await listSegments(owner.id)).some((s) => s.id === seg.id)).toBe(true);

    const ownerC = await signedInClient(owner);
    const otherC = await signedInClient(other);
    const anonC = createClient(url, anon);

    expect(
      (await ownerC.storage.from(VOICE_BUCKET).download(seg.audioPath)).error,
    ).toBeNull();
    expect(
      (await otherC.storage.from(VOICE_BUCKET).download(seg.audioPath)).error,
    ).not.toBeNull();
    expect(
      (await anonC.storage.from(VOICE_BUCKET).download(seg.audioPath)).error,
    ).not.toBeNull();

    const otherList = await otherC.storage.from(VOICE_BUCKET).list(owner.id);
    expect(otherList.data?.length ?? 0).toBe(0);

    const intruder = await otherC.storage
      .from(VOICE_BUCKET)
      .upload(`${owner.id}/intruder.webm`, audio, { contentType: "audio/webm" });
    expect(intruder.error?.message).toMatch(/row-level security/);

    const otherRows = await otherC.from("voice_segments").select("id");
    expect(otherRows.data?.length ?? 0).toBe(0);
  });

  it("4. link share token resolves without a session", async () => {
    const [seg] = await listSegments(owner.id);
    const token = newShareToken();
    await prisma.share.create({
      data: { token, userId: owner.id, segmentId: seg?.id ?? null },
    });
    const resolved = await resolveShare(token);
    expect(resolved?.userId).toBe(owner.id);
    expect(await resolveShare(`${token}x`)).toBeNull();
  });

  it("5. hardDeleteUser removes storage objects, DB rows, and the auth user", async () => {
    const snapshot = async () => ({
      voice: await storage.listAll(VOICE_BUCKET, owner.id),
      avatars: await storage.listAll(AVATARS_BUCKET, owner.id),
      users: await prisma.user.count({ where: { id: owner.id } }),
      streams: await prisma.voiceStream.count({ where: { userId: owner.id } }),
      segments: await prisma.voiceSegment.count({
        where: { stream: { userId: owner.id } },
      }),
      shares: await prisma.share.count({ where: { userId: owner.id } }),
      authUser: (await admin.auth.admin.getUserById(owner.id)).data.user,
    });

    const before = await snapshot();
    expect(before.voice.length).toBeGreaterThan(0);
    expect(before.avatars.length).toBeGreaterThan(0);
    expect(before.users).toBe(1);
    expect(before.authUser).not.toBeNull();

    const result = await hardDeleteUser(owner.id);
    console.log("[5] hardDeleteUser:", result);

    const after = await snapshot();
    expect(after).toMatchObject({
      voice: [],
      avatars: [],
      users: 0,
      streams: 0,
      segments: 0,
      shares: 0,
      authUser: null,
    });
    expect(result.dbRowsRemoved).toBe(true);
    expect(result.authUserRemoved).toBe(true);
    expect(result.objectsDeleted).toBe(before.voice.length + before.avatars.length);
  });
});
