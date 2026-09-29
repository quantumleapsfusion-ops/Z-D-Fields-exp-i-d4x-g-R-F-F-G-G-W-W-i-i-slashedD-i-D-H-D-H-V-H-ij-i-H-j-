import { beforeEach, describe, expect, it, vi } from "vitest";

import { EMBEDDING_SIZE, normalise } from "@/lib/voice/voiceprint";

const prisma = {
  voicePrint: { findMany: vi.fn(), update: vi.fn(), create: vi.fn() },
  user: { upsert: vi.fn() },
};
const admin = {
  auth: {
    admin: {
      getUserById: vi.fn(),
      generateLink: vi.fn(),
      createUser: vi.fn(),
    },
  },
};
const cookieClient = { auth: { verifyOtp: vi.fn() } };

vi.mock("@/lib/db", () => ({ prisma, db: prisma }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => admin }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => cookieClient }));

function vec(seed: number): number[] {
  const v: number[] = [];
  for (let i = 0; i < EMBEDDING_SIZE; i++) v.push(Math.sin(seed * 7 + i * 1.3));
  return normalise(v);
}

const alice = vec(1);
const aliceish = normalise(alice.map((x, i) => x + 0.02 * Math.cos(i)));
const bob = vec(2);
const PHRASE = "zachariah of earth";

describe("voice auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    admin.auth.admin.getUserById.mockResolvedValue({
      data: { user: { email: "x@voice.e1-4.com" } },
      error: null,
    });
    admin.auth.admin.generateLink.mockResolvedValue({
      data: { properties: { hashed_token: "tok" } },
      error: null,
    });
    cookieClient.auth.verifyOtp.mockResolvedValue({ error: null });
    prisma.voicePrint.update.mockResolvedValue({});
  });

  it("verifies a known voice, opens a session and refines the print", async () => {
    const { verifyVoice } = await import("./voice");
    prisma.voicePrint.findMany.mockResolvedValue([
      { id: "p1", userId: "u1", embedding: alice, sampleCount: 3 },
    ]);
    const res = await verifyVoice({ phrase: "Zachariah, of Earth!", embedding: aliceish });
    expect(res).toEqual({ ok: true, userId: "u1" });
    expect(cookieClient.auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: "tok",
      type: "magiclink",
    });
    expect(prisma.voicePrint.update).toHaveBeenCalledOnce();
  });

  it("rejects a known name spoken by a different voice", async () => {
    const { verifyVoice } = await import("./voice");
    prisma.voicePrint.findMany.mockResolvedValue([
      { id: "p1", userId: "u1", embedding: alice, sampleCount: 3 },
    ]);
    const res = await verifyVoice({ phrase: PHRASE, embedding: bob });
    expect(res).toMatchObject({ ok: false, reason: "voice-mismatch" });
    expect(cookieClient.auth.verifyOtp).not.toHaveBeenCalled();
  });

  it("reports an unknown name so the gate can offer enrolment", async () => {
    const { verifyVoice } = await import("./voice");
    prisma.voicePrint.findMany.mockResolvedValue([]);
    expect(await verifyVoice({ phrase: "nobody here", embedding: bob })).toMatchObject({
      ok: false,
      reason: "unknown-phrase",
    });
  });

  it("refuses malformed input without touching the database", async () => {
    const { verifyVoice } = await import("./voice");
    expect(await verifyVoice({ phrase: "one", embedding: bob })).toMatchObject({
      reason: "bad-input",
    });
    expect(await verifyVoice({ phrase: PHRASE, embedding: [1, 2, 3] })).toMatchObject({
      reason: "bad-input",
    });
    expect(prisma.voicePrint.findMany).not.toHaveBeenCalled();
  });

  it("enrols a new voice with a placeholder auth user and no email exposure", async () => {
    const { enrollVoice } = await import("./voice");
    prisma.voicePrint.findMany.mockResolvedValue([]);
    admin.auth.admin.createUser.mockResolvedValue({ data: { user: { id: "u9" } }, error: null });
    prisma.user.upsert.mockResolvedValue({});
    prisma.voicePrint.create.mockResolvedValue({});

    const res = await enrollVoice({ phrase: "New Voice Here", samples: [alice, aliceish] });
    expect(res).toEqual({ ok: true, userId: "u9" });
    const created = admin.auth.admin.createUser.mock.calls[0][0];
    expect(created.email).toMatch(/@voice\.e1-4\.com$/);
    expect(created.email_confirm).toBe(true);
    expect(prisma.voicePrint.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "u9", phrase: "new voice here", sampleCount: 2 }),
      }),
    );
  });

  it("will not hand an existing voice name to a different voice", async () => {
    const { enrollVoice } = await import("./voice");
    prisma.voicePrint.findMany.mockResolvedValue([{ id: "p1", userId: "u1", embedding: alice }]);
    expect(await enrollVoice({ phrase: PHRASE, samples: [bob, bob] })).toMatchObject({
      reason: "phrase-taken",
    });
    expect(admin.auth.admin.createUser).not.toHaveBeenCalled();
  });
});
