import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { hardDeleteUser } = await import("@/lib/privacy/hard-delete");
const { prisma } = await import("@/lib/db");
const { appendSegment } = await import("@/lib/voice/stream");
const { newShareToken } = await import("@/lib/voice/share");

const base = process.env.LIVE_APP_URL ?? "http://localhost:3000";
let uid = "";
let token = "";
let segmentId = "";

beforeAll(async () => {
  const user = await prisma.user.create({
    data: { displayName: "Share Owner" },
    select: { id: true },
  });
  uid = user.id;
  const seg = await appendSegment({
    userId: uid,
    audio: new Uint8Array(4096).fill(7),
    mimeType: "audio/webm",
    durationMs: 1500,
    startedAt: new Date(),
    endedAt: new Date(),
  });
  segmentId = seg.id;
  token = newShareToken();
  await prisma.share.create({ data: { token, userId: uid, segmentId } });
});

afterAll(async () => {
  if (uid) await hardDeleteUser(uid);
  await prisma.$disconnect();
});

describe(`public share page at ${base} (no session)`, () => {
  it("renders /s/<token>, serves audio, and 404s an unknown token", async () => {
    const page = await fetch(`${base}/s/${token}`, { redirect: "manual" });
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("Share Owner");

    const audio = await fetch(`${base}/api/share/${token}/audio/${segmentId}`, {
      redirect: "manual",
    });
    expect(audio.status).toBe(200);
    expect(audio.headers.get("content-type")).toContain("audio/webm");

    expect((await fetch(`${base}/s/${token}x`, { redirect: "manual" })).status).toBe(404);
  });
});
