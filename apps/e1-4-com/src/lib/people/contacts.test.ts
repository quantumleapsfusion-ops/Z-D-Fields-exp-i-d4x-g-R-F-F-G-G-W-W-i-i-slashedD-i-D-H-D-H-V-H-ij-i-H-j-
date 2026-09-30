import { beforeEach, describe, expect, it, vi } from "vitest";

import { addContact, directKeyFor, openDirect } from "./contacts";

const { db } = vi.hoisted(() => ({
  db: {
    user: { findUnique: vi.fn() },
    contact: { upsert: vi.fn() },
    conversation: { findUnique: vi.fn(), create: vi.fn() },
    conversationMember: { upsert: vi.fn() },
  },
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ prisma: db, db }));
vi.mock("@/lib/storage", () => ({ AVATARS_BUCKET: "avatars", storage: {} }));

const A = "aaaaaaaa-0000-4000-8000-000000000001";
const B = "bbbbbbbb-0000-4000-8000-000000000002";

beforeEach(() => {
  vi.clearAllMocks();
  db.user.findUnique.mockResolvedValue({ id: B });
});

describe("contacts", () => {
  it("direct key is the same from both sides", () => {
    expect(directKeyFor(A, B)).toBe(directKeyFor(B, A));
  });

  it("can't add yourself", async () => {
    await expect(addContact(A, A)).resolves.toBe(false);
    expect(db.contact.upsert).not.toHaveBeenCalled();
  });

  it("creates the one-to-one conversation once, with both people, and saves the contact", async () => {
    db.conversation.findUnique.mockResolvedValue(null);
    db.conversation.create.mockResolvedValue({ id: "c1" });
    await expect(openDirect(A, B)).resolves.toBe("c1");
    const { data } = db.conversation.create.mock.calls[0][0];
    expect(data.directKey).toBe(directKeyFor(A, B));
    expect(data.members.create.map((m: { userId: string }) => m.userId)).toEqual([A, B]);
    expect(db.contact.upsert).toHaveBeenCalled();
  });

  it("reopens the existing conversation and only re-adds the caller", async () => {
    db.conversation.findUnique.mockResolvedValue({ id: "c1" });
    await expect(openDirect(A, B)).resolves.toBe("c1");
    expect(db.conversation.create).not.toHaveBeenCalled();
    expect(db.conversationMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { conversationId_userId: { conversationId: "c1", userId: A } },
      }),
    );
  });

  it("retries when both sides open it at the same moment", async () => {
    db.conversation.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "c1" });
    db.conversation.create.mockRejectedValueOnce(
      Object.assign(new Error("dup"), { code: "P2002" }),
    );
    await expect(openDirect(A, B)).resolves.toBe("c1");
  });

  it("refuses yourself and unknown people", async () => {
    await expect(openDirect(A, A)).resolves.toBeNull();
    db.user.findUnique.mockResolvedValue(null);
    await expect(openDirect(A, B)).resolves.toBeNull();
  });
});
