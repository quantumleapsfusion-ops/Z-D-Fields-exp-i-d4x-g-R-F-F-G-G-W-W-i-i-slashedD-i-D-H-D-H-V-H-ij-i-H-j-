import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, transcriber, state } = vi.hoisted(() => ({
  prisma: { authChallenge: { delete: vi.fn(), create: vi.fn(), deleteMany: vi.fn() } },
  transcriber: { transcribe: vi.fn() },
  state: { available: true, liveness: undefined as string | undefined },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ prisma }));
vi.mock("@/lib/stt", () => ({
  getTranscriber: () => (state.available ? transcriber : null),
}));
vi.mock("@/lib/env", () => ({
  env: {
    get voiceLiveness() {
      return state.liveness;
    },
  },
}));

const { digitsIn, matchesChallenge, newDigits, verifyLiveness, livenessMode } =
  await import("./liveness");

const audio = new Blob(["x"], { type: "audio/webm" });
const live = (digits: string, ms = 60_000) => ({
  purpose: "liveness",
  challenge: digits,
  expiresAt: new Date(Date.now() + ms),
});

describe("digits", () => {
  it("reads digits however the recogniser wrote them", () => {
    expect(digitsIn("4 7 2 9")).toBe("4729");
    expect(digitsIn("Four, seven, two, nine.")).toBe("4729");
    expect(digitsIn("four seven to nine")).toBe("4729");
    expect(digitsIn("uh, 4729 right")).toBe("4729");
  });

  it("matches only when the challenge digits are said in order", () => {
    expect(matchesChallenge("okay four seven two nine", "4729")).toBe(true);
    expect(matchesChallenge("nine two seven four", "4729")).toBe(false);
    expect(matchesChallenge("hello there", "4729")).toBe(false);
  });

  it("makes four-digit challenges", () => {
    for (let i = 0; i < 20; i += 1) expect(newDigits()).toMatch(/^\d{4}$/);
  });
});

describe("verifyLiveness", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    state.available = true;
    state.liveness = undefined;
  });

  it("passes when the recording says the digits and uses the challenge once", async () => {
    prisma.authChallenge.delete.mockResolvedValue(live("4729"));
    transcriber.transcribe.mockResolvedValue({ text: "four seven two nine" });
    expect(await verifyLiveness("c1", audio)).toBe("ok");
    expect(prisma.authChallenge.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });

  it("fails on the wrong digits, an unknown id, an expired challenge or no audio", async () => {
    prisma.authChallenge.delete.mockResolvedValue(live("4729"));
    transcriber.transcribe.mockResolvedValue({ text: "one two three four" });
    expect(await verifyLiveness("c1", audio)).toBe("failed");

    prisma.authChallenge.delete.mockRejectedValue(new Error("gone"));
    expect(await verifyLiveness("c1", audio)).toBe("failed");

    prisma.authChallenge.delete.mockResolvedValue(live("4729", -1));
    expect(await verifyLiveness("c1", audio)).toBe("failed");

    expect(await verifyLiveness(null, audio)).toBe("failed");
    expect(await verifyLiveness("c1", null)).toBe("failed");
  });

  it("reports unavailable, not failed, when transcription breaks", async () => {
    prisma.authChallenge.delete.mockResolvedValue(live("4729"));
    transcriber.transcribe.mockRejectedValue(new Error("down"));
    expect(await verifyLiveness("c1", audio)).toBe("unavailable");
  });

  it("without speech-to-text: skips by default, fails closed when required", async () => {
    state.available = false;
    expect(livenessMode()).toBe("skip");
    expect(await verifyLiveness(null, null)).toBe("ok");
    state.liveness = "required";
    expect(livenessMode()).toBe("fail");
    expect(await verifyLiveness(null, null)).toBe("unavailable");
  });

  it("can be switched off", async () => {
    state.liveness = "off";
    expect(livenessMode()).toBe("skip");
    expect(await verifyLiveness(null, null)).toBe("ok");
  });
});
