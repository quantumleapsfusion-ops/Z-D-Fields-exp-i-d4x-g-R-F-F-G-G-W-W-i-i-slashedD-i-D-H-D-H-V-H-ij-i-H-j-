import { describe, expect, it } from "vitest";

import { SESSION_MAX_AGE_S, createSessionToken, readSessionToken } from "./token";

const SECRET = "test-secret";
const USER = "7ce00861-aa1d-4500-bc0b-f24a6438d585";

describe("session tokens", () => {
  it("round-trips the user id", async () => {
    const token = await createSessionToken(USER, SECRET);
    await expect(readSessionToken(token, SECRET)).resolves.toBe(USER);
  });

  it("rejects another key, a changed user and missing tokens", async () => {
    const token = await createSessionToken(USER, SECRET);
    await expect(readSessionToken(token, "other")).resolves.toBeNull();
    const [, expires, signature] = token.split(".");
    await expect(
      readSessionToken(`someone-else.${expires}.${signature}`, SECRET),
    ).resolves.toBeNull();
    await expect(readSessionToken(undefined, SECRET)).resolves.toBeNull();
    await expect(readSessionToken("garbage", SECRET)).resolves.toBeNull();
  });

  it("expires", async () => {
    const issued = Date.UTC(2026, 0, 1);
    const token = await createSessionToken(USER, SECRET, issued);
    const later = issued + SESSION_MAX_AGE_S * 1000 + 1;
    await expect(readSessionToken(token, SECRET, later - 2)).resolves.toBe(USER);
    await expect(readSessionToken(token, SECRET, later)).resolves.toBeNull();
  });
});
