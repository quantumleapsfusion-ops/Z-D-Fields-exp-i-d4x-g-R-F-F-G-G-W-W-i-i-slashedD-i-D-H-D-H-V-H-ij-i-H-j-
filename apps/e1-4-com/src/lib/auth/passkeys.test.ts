import { beforeEach, describe, expect, it, vi } from "vitest";

import { consumeChallenge, verifyAuthentication } from "./passkeys";

const { db, webauthn } = vi.hoisted(() => ({
  db: {
    authChallenge: { delete: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    passkey: { findUnique: vi.fn(), update: vi.fn() },
  },
  webauthn: {
    verifyAuthenticationResponse: vi.fn(),
    verifyRegistrationResponse: vi.fn(),
    generateAuthenticationOptions: vi.fn(),
    generateRegistrationOptions: vi.fn(),
  },
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ prisma: db, db }));
vi.mock("@/lib/env", () => ({ publicEnv: { siteUrl: "https://e1-4.com" } }));
vi.mock("@simplewebauthn/server", () => webauthn);

const future = () => new Date(Date.now() + 60_000);

beforeEach(() => vi.clearAllMocks());

describe("challenges", () => {
  it("are single use and bound to purpose, user and expiry", async () => {
    db.authChallenge.delete.mockResolvedValueOnce({
      purpose: "register",
      userId: "u1",
      challenge: "c",
      expiresAt: future(),
    });
    await expect(consumeChallenge("id", "register", "u1")).resolves.toBe("c");

    db.authChallenge.delete.mockRejectedValueOnce(new Error("not found"));
    await expect(consumeChallenge("id", "register", "u1")).resolves.toBeNull();

    db.authChallenge.delete.mockResolvedValueOnce({
      purpose: "register",
      userId: "u1",
      challenge: "c",
      expiresAt: future(),
    });
    await expect(consumeChallenge("id", "login", null)).resolves.toBeNull();

    db.authChallenge.delete.mockResolvedValueOnce({
      purpose: "login",
      userId: null,
      challenge: "c",
      expiresAt: new Date(Date.now() - 1),
    });
    await expect(consumeChallenge("id", "login", null)).resolves.toBeNull();
  });
});

describe("passkey sign-in", () => {
  const response = { id: "cred1" } as never;

  beforeEach(() => {
    db.authChallenge.delete.mockResolvedValue({
      purpose: "login",
      userId: null,
      challenge: "c",
      expiresAt: future(),
    });
  });

  it("verifies against the stored key for this site and bumps the counter", async () => {
    db.passkey.findUnique.mockResolvedValue({
      id: "cred1",
      userId: "u1",
      publicKey: new Uint8Array([1, 2]),
      counter: 3,
      transports: ["internal"],
    });
    webauthn.verifyAuthenticationResponse.mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 4 },
    });
    await expect(verifyAuthentication("ch", response)).resolves.toBe("u1");
    expect(webauthn.verifyAuthenticationResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedChallenge: "c",
        expectedOrigin: "https://e1-4.com",
        expectedRPID: "e1-4.com",
        requireUserVerification: true,
      }),
    );
    expect(db.passkey.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ counter: 4 }) }),
    );
  });

  it("rejects unknown credentials and failed signatures", async () => {
    db.passkey.findUnique.mockResolvedValueOnce(null);
    await expect(verifyAuthentication("ch", response)).rejects.toThrow(
      "isn't registered",
    );

    db.passkey.findUnique.mockResolvedValueOnce({
      id: "cred1",
      userId: "u1",
      publicKey: new Uint8Array([1]),
      counter: 0,
      transports: [],
    });
    webauthn.verifyAuthenticationResponse.mockResolvedValueOnce({ verified: false });
    await expect(verifyAuthentication("ch", response)).rejects.toThrow("not verified");
    expect(db.passkey.update).not.toHaveBeenCalled();
  });
});
