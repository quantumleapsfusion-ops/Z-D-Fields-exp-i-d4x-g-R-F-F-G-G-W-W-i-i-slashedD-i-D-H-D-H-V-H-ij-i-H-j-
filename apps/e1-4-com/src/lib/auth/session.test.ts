import { createHash } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, cookieStore } = vi.hoisted(() => ({
  prisma: {
    session: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
  cookieStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("server-only", () => ({}));
vi.mock("react", () => ({ cache: (fn: unknown) => fn }));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => cookieStore) }));
vi.mock("@/lib/db", () => ({ prisma }));

const { SESSION_COOKIE, createSession, currentSessionUserId, endSession } =
  await import("@/lib/auth/session");

const SESSION_SECONDS = 30 * 24 * 60 * 60;

describe("session", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("NODE_ENV", "production");
  });

  it("stores only the token hash and sets a secure, HTTP-only cookie", async () => {
    await createSession("user-1");

    const [{ data }] = prisma.session.create.mock.calls[0];
    const [[cookieName, token, options]] = cookieStore.set.mock.calls;
    expect(cookieName).toBe(SESSION_COOKIE);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(data.tokenHash).toBe(createHash("sha256").update(token).digest("hex"));
    expect(data.tokenHash).not.toBe(token);
    expect(data.expiresAt.getTime() - data.lastSeenAt.getTime()).toBe(
      SESSION_SECONDS * 1000,
    );
    expect(options).toEqual({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: true,
      maxAge: SESSION_SECONDS,
    });
  });

  it("looks up only unexpired sessions and returns null for an expired token", async () => {
    cookieStore.get.mockReturnValue({ value: "expired-token" });
    prisma.session.findFirst.mockResolvedValue(null);

    await expect(currentSessionUserId()).resolves.toBeNull();

    const [{ where }] = prisma.session.findFirst.mock.calls[0];
    expect(where.tokenHash).toBe(
      createHash("sha256").update("expired-token").digest("hex"),
    );
    expect(where.expiresAt.gt).toBeInstanceOf(Date);
  });

  it("slides a session after 24 hours and tolerates read-only cookies", async () => {
    const token = "active-token";
    cookieStore.get.mockReturnValue({ value: token });
    cookieStore.set.mockImplementation(() => {
      throw new Error("cookies are read-only");
    });
    prisma.session.findFirst.mockResolvedValue({
      userId: "user-1",
      lastSeenAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
    });

    await expect(currentSessionUserId()).resolves.toBe("user-1");

    const tokenHash = createHash("sha256").update(token).digest("hex");
    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { tokenHash },
      data: {
        lastSeenAt: expect.any(Date),
        expiresAt: expect.any(Date),
      },
    });
    const [{ data }] = prisma.session.update.mock.calls[0];
    expect(data.expiresAt.getTime() - data.lastSeenAt.getTime()).toBe(
      SESSION_SECONDS * 1000,
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      SESSION_COOKIE,
      token,
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: SESSION_SECONDS,
      }),
    );
  });

  it("deletes the database session and cookie on sign-out", async () => {
    cookieStore.get.mockReturnValue({ value: "signed-in-token" });

    await endSession();

    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: {
        tokenHash: createHash("sha256").update("signed-in-token").digest("hex"),
      },
    });
    expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE);
  });
});
