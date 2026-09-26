import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubEnv } from "@/test/stub-env";

async function loadLlm(env: Record<string, string | undefined> = {}) {
  stubEnv(env);
  return import("@/lib/llm");
}

async function loadStt(env: Record<string, string | undefined> = {}) {
  stubEnv(env);
  return import("@/lib/stt");
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("getLanguageModel", () => {
  it("returns null (stub mode) when no LLM key is configured", async () => {
    const { getLanguageModel } = await loadLlm();
    expect(getLanguageModel()).toBeNull();
    expect(getLanguageModel("everyday")).toBeNull();
    expect(getLanguageModel("heavy")).toBeNull();
  });

  it("returns null when LLM_PROVIDER=none even if keys are present", async () => {
    const { getLanguageModel } = await loadLlm({
      LLM_PROVIDER: "none",
      ANTHROPIC_API_KEY: "sk-ant",
      OPENAI_API_KEY: "sk-oai",
    });
    expect(getLanguageModel("heavy")).toBeNull();
  });

  it("returns null when the forced provider has no key (does not silently switch provider)", async () => {
    const { getLanguageModel } = await loadLlm({
      LLM_PROVIDER: "anthropic",
      OPENAI_API_KEY: "sk-oai",
    });
    expect(getLanguageModel()).toBeNull();

    const openaiForced = await loadLlm({
      LLM_PROVIDER: "openai",
      ANTHROPIC_API_KEY: "sk-ant",
    });
    expect(openaiForced.getLanguageModel()).toBeNull();
  });

  it("treats blank keys as missing", async () => {
    const { getLanguageModel } = await loadLlm({
      ANTHROPIC_API_KEY: "   ",
      OPENAI_API_KEY: "",
    });
    expect(getLanguageModel()).toBeNull();
  });

  it("prefers Anthropic when both keys exist and picks the model by tier", async () => {
    const { getLanguageModel } = await loadLlm({
      ANTHROPIC_API_KEY: "sk-ant",
      OPENAI_API_KEY: "sk-oai",
    });
    const everyday = getLanguageModel("everyday");
    const heavy = getLanguageModel("heavy");
    expect(everyday?.name).toBe("anthropic:claude-sonnet-5");
    expect(everyday?.model).toBe("claude-sonnet-5");
    expect(heavy?.name).toBe("anthropic:claude-fable-5-1");
    expect(heavy?.model).toBe("claude-fable-5-1");
  });

  it("honours LLM_MODEL_EVERYDAY / LLM_MODEL_HEAVY overrides", async () => {
    const { getLanguageModel } = await loadLlm({
      ANTHROPIC_API_KEY: "sk-ant",
      LLM_MODEL_EVERYDAY: "claude-haiku-4-5",
      LLM_MODEL_HEAVY: "claude-sonnet-5",
    });
    expect(getLanguageModel("everyday")?.model).toBe("claude-haiku-4-5");
    expect(getLanguageModel("heavy")?.model).toBe("claude-sonnet-5");
  });

  it("falls back to OpenAI when only OPENAI_API_KEY is set (same model for both tiers)", async () => {
    const { getLanguageModel } = await loadLlm({ OPENAI_API_KEY: "sk-oai" });
    expect(getLanguageModel("everyday")?.name).toBe("openai:gpt-4o");
    expect(getLanguageModel("heavy")?.name).toBe("openai:gpt-4o");
  });

  it("uses OpenAI when forced, even if Anthropic is also keyed", async () => {
    const { getLanguageModel } = await loadLlm({
      LLM_PROVIDER: "openai",
      ANTHROPIC_API_KEY: "sk-ant",
      OPENAI_API_KEY: "sk-oai",
      OPENAI_MODEL: "gpt-4o-mini",
    });
    expect(getLanguageModel()?.name).toBe("openai:gpt-4o-mini");
  });

  it("never performs network I/O just by selecting a provider", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { getLanguageModel } = await loadLlm({
      ANTHROPIC_API_KEY: "sk-ant",
      OPENAI_API_KEY: "sk-oai",
    });
    getLanguageModel("everyday");
    getLanguageModel("heavy");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("extractJson", () => {
  it("parses bare, fenced and prose-wrapped JSON", async () => {
    const { extractJson } = await loadLlm();
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
    expect(extractJson('Sure!\n```json\n{"a":[1,2]}\n```\nDone.')).toEqual({ a: [1, 2] });
    expect(extractJson("here: [1,2,3] ok")).toEqual([1, 2, 3]);
  });

  it("throws when the reply contains no JSON", async () => {
    const { extractJson } = await loadLlm();
    expect(() => extractJson("nothing here")).toThrow(/No JSON/);
  });
});

describe("getTranscriber", () => {
  it("returns null (stub mode) when no STT key is configured", async () => {
    const { getTranscriber } = await loadStt();
    expect(getTranscriber()).toBeNull();
  });

  it("returns null when STT_PROVIDER=none even if keys are present", async () => {
    const { getTranscriber } = await loadStt({
      STT_PROVIDER: "none",
      DEEPGRAM_API_KEY: "dg",
      OPENAI_API_KEY: "sk-oai",
    });
    expect(getTranscriber()).toBeNull();
  });

  it("returns null when the forced provider has no key", async () => {
    const dg = await loadStt({ STT_PROVIDER: "deepgram", OPENAI_API_KEY: "sk-oai" });
    expect(dg.getTranscriber()).toBeNull();
    const whisper = await loadStt({ STT_PROVIDER: "whisper", DEEPGRAM_API_KEY: "dg" });
    expect(whisper.getTranscriber()).toBeNull();
  });

  it("prefers Deepgram when both keys exist", async () => {
    const { getTranscriber } = await loadStt({
      DEEPGRAM_API_KEY: "dg",
      OPENAI_API_KEY: "sk-oai",
    });
    expect(getTranscriber()?.name).toBe("deepgram");
  });

  it("falls back to Whisper when only OPENAI_API_KEY is set", async () => {
    const { getTranscriber } = await loadStt({ OPENAI_API_KEY: "sk-oai" });
    expect(getTranscriber()?.name).toBe("whisper");
  });

  it("uses Whisper when forced even if Deepgram is keyed", async () => {
    const { getTranscriber } = await loadStt({
      STT_PROVIDER: "whisper",
      DEEPGRAM_API_KEY: "dg",
      OPENAI_API_KEY: "sk-oai",
    });
    expect(getTranscriber()?.name).toBe("whisper");
  });
});

describe("getLiveTranscriptionConfig", () => {
  it("falls back to the browser Web Speech API when Deepgram is not keyed", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { getLiveTranscriptionConfig } = await loadStt({ OPENAI_API_KEY: "sk-oai" });
    await expect(getLiveTranscriptionConfig()).resolves.toEqual({ provider: "browser" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the browser when STT_PROVIDER is none or whisper", async () => {
    for (const provider of ["none", "whisper"]) {
      const { getLiveTranscriptionConfig } = await loadStt({
        STT_PROVIDER: provider,
        DEEPGRAM_API_KEY: "dg",
      });
      await expect(getLiveTranscriptionConfig()).resolves.toEqual({
        provider: "browser",
      });
    }
  });

  it("mints a short-lived Deepgram token and never exposes the API key", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ access_token: "jwt-123" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { getLiveTranscriptionConfig } = await loadStt({
      DEEPGRAM_API_KEY: "dg-secret",
      DEEPGRAM_MODEL: "nova-3",
    });
    const config = await getLiveTranscriptionConfig();
    expect(config).toEqual({ provider: "deepgram", token: "jwt-123", model: "nova-3" });
    expect(JSON.stringify(config)).not.toContain("dg-secret");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.deepgram.com/v1/auth/grant",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("degrades to the browser when the Deepgram grant fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 401 })),
    );
    const { getLiveTranscriptionConfig } = await loadStt({ DEEPGRAM_API_KEY: "dg" });
    await expect(getLiveTranscriptionConfig()).resolves.toEqual({ provider: "browser" });
    expect(console.error).toHaveBeenCalled();
  });
});
