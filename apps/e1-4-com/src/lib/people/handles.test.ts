import { beforeEach, describe, expect, it, vi } from "vitest";

import { claimHandle, findByHandle, handleProblem, normalizeHandle } from "./handles";

const { db } = vi.hoisted(() => ({
  db: { user: { update: vi.fn(), findUnique: vi.fn() } },
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ prisma: db, db }));
vi.mock("@/lib/storage", () => ({
  AVATARS_BUCKET: "avatars",
  storage: { getPublicUrl: (_b: string, p: string) => `https://cdn/${p}` },
}));

beforeEach(() => vi.clearAllMocks());

describe("handles", () => {
  it("normalizes @, case and whitespace", () => {
    expect(normalizeHandle("  @Zach_E ")).toBe("zach_e");
  });

  it("rejects bad shapes and reserved names", () => {
    expect(handleProblem("ab")).not.toBeNull();
    expect(handleProblem("has space")).not.toBeNull();
    expect(handleProblem("a".repeat(21))).not.toBeNull();
    expect(handleProblem("admin")).toBe("That handle is reserved");
    expect(handleProblem("zachariah")).toBeNull();
  });

  it("claims a free handle and reports a taken one", async () => {
    db.user.update.mockResolvedValueOnce({});
    await expect(claimHandle("u1", "@Zach")).resolves.toEqual({
      ok: true,
      handle: "zach",
    });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { handle: "zach" },
    });
    db.user.update.mockRejectedValueOnce(
      Object.assign(new Error("dup"), { code: "P2002" }),
    );
    await expect(claimHandle("u2", "zach")).resolves.toEqual({
      ok: false,
      message: "@zach is taken",
    });
  });

  it("looks people up by exact handle only", async () => {
    db.user.findUnique.mockResolvedValue({
      id: "u1",
      handle: "zach",
      displayName: null,
      avatarPath: "u1/a.png",
    });
    await expect(findByHandle("@ZACH")).resolves.toEqual({
      id: "u1",
      handle: "zach",
      name: "@zach",
      image: "https://cdn/u1/a.png",
    });
    expect(db.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { handle: "zach" } }),
    );
    await expect(findByHandle("x")).resolves.toBeNull();
  });
});
