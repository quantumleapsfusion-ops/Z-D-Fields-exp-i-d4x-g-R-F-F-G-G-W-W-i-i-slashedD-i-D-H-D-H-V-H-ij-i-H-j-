import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  appendNote,
  deleteOwnNotes,
  findByInvite,
  getThread,
  joinByInvite,
  leaveConversation,
  setLive,
  TALK_LIMITS,
  TalkRateLimitError,
} from "./conversations";

const { db, storage } = vi.hoisted(() => ({
  db: {
    conversation: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    conversationMember: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    voiceNote: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
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
  db.$transaction.mockImplementation(async (ops: unknown) =>
    typeof ops === "function" ? ops(db) : Promise.all(ops as unknown[]),
  );
  db.voiceNote.count.mockResolvedValue(0);
  db.voiceNote.aggregate.mockResolvedValue({ _sum: { sizeBytes: 0 } });
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

  it("refreshes the heartbeat only for the still-active live stream", async () => {
    db.conversationMember.findUnique.mockResolvedValue({ userId: ME });
    db.voiceNote.create.mockImplementation(async ({ data }) => data);
    const liveId = "33333333-3333-4333-8333-333333333333";
    await appendNote({ ...input(), liveId });
    expect(db.conversationMember.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { conversationId: CONV, userId: ME, liveId },
        data: { liveAt: expect.any(Date) },
      }),
    );
    expect(db.conversationMember.updateMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ liveId }) }),
    );
  });

  it("rate-limits bursts and daily volume before uploading", async () => {
    db.conversationMember.findUnique.mockResolvedValue({ userId: ME });
    db.voiceNote.count.mockResolvedValueOnce(TALK_LIMITS.clipsPerMinute);
    await expect(appendNote(input())).rejects.toBeInstanceOf(TalkRateLimitError);
    db.voiceNote.aggregate.mockResolvedValueOnce({
      _sum: { sizeBytes: TALK_LIMITS.bytesPerDay },
    });
    await expect(appendNote(input())).rejects.toBeInstanceOf(TalkRateLimitError);
    expect(storage.upload).not.toHaveBeenCalled();
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
  it("unsend only deletes the caller's own notes in conversations they're still in", async () => {
    db.voiceNote.findMany.mockResolvedValue([
      { id: "n1", audioPath: `${ME}/talk/x.webm`, conversationId: CONV },
    ]);
    db.voiceNote.findFirst.mockResolvedValue(null);
    await expect(deleteOwnNotes(ME, ["n1", "someone-elses"])).resolves.toBe(1);
    expect(db.voiceNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: { in: ["n1", "someone-elses"] },
          senderId: ME,
          conversation: { members: { some: { userId: ME } } },
        },
      }),
    );
    expect(db.voiceNote.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["n1"] } },
    });
  });

  it("recomputes lastNoteAt after unsending", async () => {
    const monday = new Date("2026-09-28T10:00:00Z");
    db.voiceNote.findMany.mockResolvedValue([
      { id: "n1", audioPath: "p", conversationId: CONV },
    ]);
    db.voiceNote.findFirst.mockResolvedValue({ createdAt: monday });
    await deleteOwnNotes(ME, ["n1"]);
    expect(db.conversation.updateMany).toHaveBeenCalledWith({
      where: { id: CONV },
      data: { lastNoteAt: monday },
    });
  });

  it("leaving keeps the conversation while others are still in it", async () => {
    db.$queryRaw.mockResolvedValue([{ id: CONV }]);
    db.conversationMember.findUnique.mockResolvedValue({ userId: ME });
    db.conversationMember.count.mockResolvedValue(1);
    await leaveConversation(ME, CONV);
    expect(db.conversationMember.delete).toHaveBeenCalled();
    expect(storage.remove).not.toHaveBeenCalled();
    expect(db.conversation.delete).not.toHaveBeenCalled();
  });

  it("the last member out destroys every note's audio, then the conversation", async () => {
    db.$queryRaw.mockResolvedValue([{ id: CONV }]);
    db.conversationMember.findUnique.mockResolvedValue({ userId: ME });
    db.conversationMember.count.mockResolvedValue(0);
    db.voiceNote.findMany.mockResolvedValue([
      { audioPath: "a/talk/1.webm" },
      { audioPath: "b/talk/2.m4a" },
    ]);
    await leaveConversation(ME, CONV);
    expect(storage.remove).toHaveBeenCalledWith("voice", [
      "a/talk/1.webm",
      "b/talk/2.m4a",
    ]);
    expect(db.conversation.delete).toHaveBeenCalledWith({ where: { id: CONV } });
  });

  it("keeps the last membership when storage cleanup fails, so leaving can be retried", async () => {
    db.$queryRaw.mockResolvedValue([{ id: CONV }]);
    db.conversationMember.findUnique.mockResolvedValue({ userId: ME });
    db.conversationMember.count.mockResolvedValue(0);
    db.voiceNote.findMany.mockResolvedValue([{ audioPath: "a/talk/1.webm" }]);
    storage.remove.mockRejectedValueOnce(new Error("storage down"));
    await expect(leaveConversation(ME, CONV)).rejects.toThrow("storage down");
    expect(db.conversationMember.delete).not.toHaveBeenCalled();
    expect(db.conversation.delete).not.toHaveBeenCalled();
  });

  it("does nothing for non-members", async () => {
    db.$queryRaw.mockResolvedValue([{ id: CONV }]);
    db.conversationMember.findUnique.mockResolvedValue(null);
    await leaveConversation(ME, CONV);
    expect(db.conversation.delete).not.toHaveBeenCalled();
    expect(db.conversationMember.delete).not.toHaveBeenCalled();
  });
});
