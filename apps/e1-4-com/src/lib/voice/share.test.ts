import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/db";

import { newShareToken, resolveShare } from "./share";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: { share: { findUnique: vi.fn() } },
}));
vi.mock("@/lib/db", () => ({ prisma: mockPrisma, db: mockPrisma }));

const findUnique = vi.mocked(prisma.share.findUnique);

function share(token: string, revokedAt: Date | null) {
  return {
    id: "share-1",
    createdAt: new Date(0),
    userId: "user-1",
    token,
    segmentId: null,
    includeAudio: true,
    includeTranscript: true,
    revokedAt,
  };
}

beforeEach(() => findUnique.mockReset());

describe("newShareToken", () => {
  it("is URL-safe, 24 chars, and unique", () => {
    const tokens = new Set(Array.from({ length: 200 }, newShareToken));
    expect(tokens.size).toBe(200);
    for (const t of tokens) expect(t).toMatch(/^[A-Za-z0-9_-]{24}$/);
  });

  it("round-trips through resolveShare's format check", async () => {
    const token = newShareToken();
    findUnique.mockResolvedValueOnce(share(token, null));
    await expect(resolveShare(token)).resolves.toMatchObject({ token });
    expect(findUnique).toHaveBeenCalledWith({ where: { token } });
  });
});

describe("resolveShare", () => {
  it("rejects malformed tokens without touching the database", async () => {
    for (const bad of [
      "",
      "short",
      "has space here",
      "semi;colon-injection",
      "x".repeat(65),
    ]) {
      await expect(resolveShare(bad)).resolves.toBeNull();
    }
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("returns null for unknown or revoked shares", async () => {
    findUnique.mockResolvedValueOnce(null);
    await expect(resolveShare("a".repeat(24))).resolves.toBeNull();
    findUnique.mockResolvedValueOnce(share("t", new Date()));
    await expect(resolveShare("b".repeat(24))).resolves.toBeNull();
  });
});
