import { beforeEach, describe, expect, it, vi } from "vitest";

const LLM_VARS = [
  "LLM_PROVIDER",
  "ANTHROPIC_API_KEY",
  "AI_GATEWAY_API_KEY",
  "AI_GATEWAY_BASE_URL",
  "OPENAI_API_KEY",
  "LLM_MODEL_EVERYDAY",
  "LLM_MODEL_HEAVY",
  "OPENAI_MODEL",
  "DAVINCI_URL",
  "DAVINCI_SECRET",
];

async function load(vars: Record<string, string>) {
  vi.resetModules();
  for (const k of LLM_VARS) vi.stubEnv(k, "");
  for (const [k, v] of Object.entries(vars)) vi.stubEnv(k, v);
  return import("@/lib/llm");
}

beforeEach(() => vi.unstubAllEnvs());

describe("getLanguageModel", () => {
  it("returns null with no keys so callers fall back to stubs", async () => {
    const { getLanguageModel } = await load({});
    expect(getLanguageModel()).toBeNull();
    expect(getLanguageModel("heavy")).toBeNull();
  });

  it("prefers Anthropic and picks the model by tier", async () => {
    const { getLanguageModel } = await load({
      ANTHROPIC_API_KEY: "a",
      OPENAI_API_KEY: "o",
    });
    const everyday = getLanguageModel("everyday");
    const heavy = getLanguageModel("heavy");
    expect(everyday).toMatchObject({ name: expect.stringMatching(/^anthropic:/) });
    expect(heavy).toMatchObject({ name: expect.stringMatching(/^anthropic:/) });
    expect(everyday?.model).toBe("claude-sonnet-5");
    expect(heavy?.model).toBe("claude-fable-5-1");
  });

  it("routes through the AI Gateway when AI_GATEWAY_API_KEY is set, even alongside a direct key", async () => {
    const { getLanguageModel } = await load({
      AI_GATEWAY_API_KEY: "g",
      ANTHROPIC_API_KEY: "a",
    });
    expect(getLanguageModel("heavy")?.name).toBe(
      "anthropic-gateway:anthropic/claude-fable-5.1",
    );
    expect(getLanguageModel()?.name).toBe("anthropic-gateway:anthropic/claude-sonnet-5");
  });

  it("honours LLM_MODEL_* overrides", async () => {
    const { getLanguageModel } = await load({
      ANTHROPIC_API_KEY: "a",
      LLM_MODEL_EVERYDAY: "claude-haiku-4-5",
      LLM_MODEL_HEAVY: "claude-opus-x",
    });
    expect(getLanguageModel("everyday")?.model).toBe("claude-haiku-4-5");
    expect(getLanguageModel("heavy")?.model).toBe("claude-opus-x");
  });

  it("falls back to OpenAI when only that key exists, regardless of tier", async () => {
    const { getLanguageModel } = await load({ OPENAI_API_KEY: "o" });
    expect(getLanguageModel("heavy")).toMatchObject({
      name: expect.stringMatching(/^openai:/),
    });
    expect(getLanguageModel("heavy")?.model).toBe("gpt-4o");
  });

  it("LLM_PROVIDER forces a provider; none disables", async () => {
    const forced = await load({
      LLM_PROVIDER: "openai",
      ANTHROPIC_API_KEY: "a",
      OPENAI_API_KEY: "o",
    });
    expect(forced.getLanguageModel()).toMatchObject({
      name: expect.stringMatching(/^openai:/),
    });

    const unkeyed = await load({ LLM_PROVIDER: "anthropic", OPENAI_API_KEY: "o" });
    expect(unkeyed.getLanguageModel()).toBeNull();

    const none = await load({ LLM_PROVIDER: "none", ANTHROPIC_API_KEY: "a" });
    expect(none.getLanguageModel()).toBeNull();
  });

  it("prefers Da Vinci over third-party keys when DAVINCI_URL + DAVINCI_SECRET are set", async () => {
    const { getLanguageModel } = await load({
      DAVINCI_URL: "https://davinci.example",
      DAVINCI_SECRET: "s".repeat(32),
      ANTHROPIC_API_KEY: "a",
      OPENAI_API_KEY: "o",
    });
    expect(getLanguageModel("everyday")).toMatchObject({
      name: "davinci:everyday",
      model: "davinci",
    });
    expect(getLanguageModel("heavy")).toMatchObject({
      name: "davinci:heavy",
      model: "davinci-heavy",
    });
  });

  it("ignores a half-configured Da Vinci and never selects it when forced without config", async () => {
    const half = await load({
      DAVINCI_URL: "https://davinci.example",
      ANTHROPIC_API_KEY: "a",
    });
    expect(half.getLanguageModel()).toMatchObject({
      name: expect.stringMatching(/^anthropic:/),
    });

    const forced = await load({ LLM_PROVIDER: "davinci", ANTHROPIC_API_KEY: "a" });
    expect(forced.getLanguageModel()).toBeNull();
  });
});

describe("extractJson", () => {
  it("parses bare, fenced and prose-wrapped JSON", async () => {
    const { extractJson } = await load({});
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
    expect(extractJson('Sure!\n```json\n{"a":[1,2]}\n```\nDone.')).toEqual({ a: [1, 2] });
    expect(extractJson("here you go: [1, 2, 3] thanks")).toEqual([1, 2, 3]);
  });

  it("throws when there is no JSON at all", async () => {
    const { extractJson } = await load({});
    expect(() => extractJson("nothing here")).toThrow(/No JSON/);
  });
});
