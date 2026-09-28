import { beforeEach, describe, expect, it, vi } from "vitest";

const STT_VARS = ["STT_PROVIDER", "OPENAI_API_KEY", "DEEPGRAM_API_KEY", "DEEPGRAM_MODEL"];

async function load(vars: Record<string, string>) {
  vi.resetModules();
  for (const k of STT_VARS) vi.stubEnv(k, "");
  for (const [k, v] of Object.entries(vars)) vi.stubEnv(k, v);
  return import("@/lib/stt");
}

beforeEach(() => vi.unstubAllEnvs());

describe("getTranscriber", () => {
  it("returns null when no key is configured", async () => {
    const { getTranscriber } = await load({});
    expect(getTranscriber()).toBeNull();
  });

  it("prefers Deepgram when both keys are present", async () => {
    const { getTranscriber } = await load({
      DEEPGRAM_API_KEY: "dg",
      OPENAI_API_KEY: "oa",
    });
    expect(getTranscriber()).toMatchObject({ name: "deepgram" });
  });

  it("falls back to Whisper when only OpenAI is keyed", async () => {
    const { getTranscriber } = await load({ OPENAI_API_KEY: "oa" });
    expect(getTranscriber()).toMatchObject({ name: "whisper" });
  });

  it("STT_PROVIDER forces a provider and returns null if its key is missing", async () => {
    const forced = await load({
      STT_PROVIDER: "whisper",
      DEEPGRAM_API_KEY: "dg",
      OPENAI_API_KEY: "oa",
    });
    expect(forced.getTranscriber()).toMatchObject({ name: "whisper" });

    const unkeyed = await load({ STT_PROVIDER: "deepgram", OPENAI_API_KEY: "oa" });
    expect(unkeyed.getTranscriber()).toBeNull();
  });

  it("STT_PROVIDER=none disables transcription even with keys", async () => {
    const { getTranscriber } = await load({
      STT_PROVIDER: "none",
      DEEPGRAM_API_KEY: "dg",
    });
    expect(getTranscriber()).toBeNull();
  });
});

describe("getLiveTranscriptionConfig", () => {
  it("uses the browser when Deepgram is not available", async () => {
    const { getLiveTranscriptionConfig } = await load({ OPENAI_API_KEY: "oa" });
    await expect(getLiveTranscriptionConfig()).resolves.toEqual({ provider: "browser" });
  });

  it("falls back to the browser when the Deepgram token grant fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 500 })),
    );
    const { getLiveTranscriptionConfig } = await load({ DEEPGRAM_API_KEY: "dg" });
    await expect(getLiveTranscriptionConfig()).resolves.toEqual({ provider: "browser" });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});
