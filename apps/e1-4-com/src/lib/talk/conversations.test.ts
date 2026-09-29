import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  appendNote,
  deleteConversationIfEmpty,
  deleteOwnNotes,
  findByInvite,
  getThread,
  joinByInvite,
  setLive,
} from "./conversations";

const { db, storage } = vi.hoisted(() => ({
  db: {
    conversation: { findUnique: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    conversationMember: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    voiceNote: { create: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
  storage: { upload: vi.fn(), remove: vi.fn(), getPublicUrl: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ prisma: db, db }));
vi.mock("@/lib/storage", () => ({
  storage,
  VOICE_BUCKET: "voice",
  AVATARS_BUCKET: "avatars",
}));
vi.mock("@/lib/stt", () => ({ getTranscriber: () => null }));

const CONV = "11111111-1111-4111-8111-111111111111";
const ME = "22222222-2222-4222-8222-222222222222";

const input = () => ({
  userId: ME,
  conversationId: CONV,
  liveId: null,
  audio: new Uint8Array([1, 2, 3]),
  mimeType: "audio/webm;codecs=opus",
  durationMs: 1234.4,
  startedAt: new Date(0),
  endedAt: new Date(1234),
});

beforeEach(() => {
  vi.clearAllMocks();
  db.$transaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops));
});

describe("membership gates", () => {
  it("appendNote refuses non-members before touching storage", async () => {
    db.conversationMember.findUnique.mockResolvedValue(null);
    await expect(appendNote(input())).resolves.toBeNull();
    expect(storage.upload).not.toHaveBeenCalled();
    expect(db.voiceNote.create).not.toHaveBeenCalled();
  });

  it("getThread hides conversations the viewer is not in", async () => {
    db.conversationMember.findUnique.mockResolvedValue(null);
    await expect(getThread(ME, CONV)).resolves.toBeNull();
    expect(db.conversation.findUnique).not.toHaveBeenCalled();
  });

  it("setLive only affects the caller's own membership row", async () => {
    db.conversationMember.updateMany.mockResolvedValue({ count: 0 });
    await expect(setLive(ME, CONV, null)).resolves.toBe(false);
    expect(db.conversationMember.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { conversationId: CONV, userId: ME } }),
    );
  });
});

describe("appendNote", () => {
  it("stores audio under the sender's uid and skips STT when no provider is set", async () => {
    db.conversationMember.findUnique.mockResolvedValue({ userId: ME });
    db.voiceNote.create.mockImplementation(async ({ data }) => data);
    const note = await appendNote(input());
    expect(note?.audioPath).toMatch(
      new RegExp(`^${ME}/talk/${CONV}/[0-9a-f-]{36}\\.webm$`),
    );
    expect(note?.durationMs).toBe(1234);
    expect(note?.transcriptionStatus).toBe("SKIPPED");
    expect(storage.upload).toHaveBeenCalledWith(
      expect.objectContaining({ bucket: "voice", path: note?.audioPath }),
    );
  });

  it("refreshes the live heartbeat for live parts", async () => {
    db.conversationMember.findUnique.mockResolvedValue({ userId: ME });
    db.voiceNote.create.mockImplementation(async ({ data }) => data);
    const liveId = "33333333-3333-4333-8333-333333333333";
    await appendNote({ ...input(), liveId });
    expect(db.conversationMember.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ liveId }) }),
    );
  });

  it("removes the uploaded blob if the row can't be written", async () => {
    db.conversationMember.findUnique.mockResolvedValue({ userId: ME });
    db.$transaction.mockRejectedValue(new Error("db down"));
    await expect(appendNote(input())).rejects.toThrow("db down");
    const path = storage.upload.mock.calls[0][0].path;
    expect(storage.remove).toHaveBeenCalledWith("voice", [path]);
  });
});

describe("invites", () => {
  it("rejects malformed tokens without a query", async () => {
    await expect(findByInvite("../../etc")).resolves.toBeNull();
    expect(db.conversation.findUnique).not.toHaveBeenCalled();
  });

  it("joins idempotently", async () => {
    db.conversation.findUnique.mockResolvedValue({ id: CONV });
    await expect(joinByInvite(ME, "A".repeat(24))).resolves.toBe(CONV);
    expect(db.conversationMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { conversationId_userId: { conversationId: CONV, userId: ME } },
        update: {},
      }),
    );
  });
});

describe("deletion", () => {
  it("unsend only deletes the caller's own notes", async () => {
    db.voiceNote.findMany.mockResolvedValue([
      { id: "n1", audioPath: `${ME}/talk/x.webm` },
    ]);
    await expect(deleteOwnNotes(ME, ["n1", "someone-elses"])).resolves.toBe(1);
    expect(db.voiceNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ["n1", "someone-elses"] }, senderId: ME },
      }),
    );
    expect(db.voiceNote.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["n1"] } },
    });
  });

  it("keeps a conversation while anyone is still in it", async () => {
    db.conversationMember.count.mockResolvedValue(1);
    await expect(deleteConversationIfEmpty(CONV)).resolves.toBe(false);
    expect(storage.remove).not.toHaveBeenCalled();
    expect(db.conversation.deleteMany).not.toHaveBeenCalled();
  });

  it("destroys every remaining note's audio when the last member leaves", async () => {
    db.conversationMember.count.mockResolvedValue(0);
    db.voiceNote.findMany.mockResolvedValue([
      { audioPath: "a/talk/1.webm" },
      { audioPath: "b/talk/2.m4a" },
    ]);
    await expect(deleteConversationIfEmpty(CONV)).resolves.toBe(true);
    expect(storage.remove).toHaveBeenCalledWith("voice", [
      "a/talk/1.webm",
      "b/talk/2.m4a",
    ]);
    expect(db.conversation.deleteMany).toHaveBeenCalledWith({ where: { id: CONV } });
  });
});
