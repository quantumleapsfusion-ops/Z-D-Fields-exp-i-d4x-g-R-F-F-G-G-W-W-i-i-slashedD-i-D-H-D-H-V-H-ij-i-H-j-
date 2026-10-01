import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, createSession } = vi.hoisted(() => ({
  prisma: {
    voiceprint: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: { create: vi.fn() },
    loginEvent: { create: vi.fn() },
  },
  createSession: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ prisma }));
vi.mock("@/lib/auth/session", () => ({ createSession }));

const { identifyVoice } = await import("./identity");
const { isVoiceprint } = await import("./voiceprint");

const context = { clientHash: "h", device: null };
/** A print whose every coefficient is `fill`; two prints far apart in `fill` are different voices. */
const print = (fill: number) => {
  for (let n = 1; n < 64; n += 1) {
    const candidate = Array(n).fill(fill);
    if (isVoiceprint(candidate)) return candidate;
  }
  throw new Error("no print length matched");
};

describe("identifyVoice, signed out", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prisma.voiceprint.findMany.mockResolvedValue([]);
    prisma.user.create.mockResolvedValue({ id: "new" });
  });

  it("refuses a voice nobody knows unless a new stream was asked for", async () => {
    const result = await identifyVoice(print(0), null, context);
    expect(result).toEqual({ userId: null, enrolled: false, matched: false });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
  });

  it("opens a new stream for an unknown voice when asked", async () => {
    const result = await identifyVoice(print(0), null, { ...context, enrol: true });
    expect(result).toEqual({ userId: "new", enrolled: true, matched: true });
    expect(createSession).toHaveBeenCalledWith("new");
  });

  it("logs a signed-in mismatch as a failure", async () => {
    prisma.voiceprint.findUnique.mockResolvedValue({ print: print(0) });
    const result = await identifyVoice(print(100), "me", context);
    expect(result.matched).toBe(false);
    expect(prisma.loginEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ success: false }) }),
    );
  });
});
