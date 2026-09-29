import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "test-secret-0123456789abcdef";

async function load(vars: Record<string, string> = {}) {
  vi.resetModules();
  vi.stubEnv("DAVINCI_URL", "");
  vi.stubEnv("DAVINCI_SECRET", "");
  for (const [k, v] of Object.entries(vars)) vi.stubEnv(k, v);
  return import("@/lib/davinci/client");
}

function mockFetch(
  handler: (url: string, init: RequestInit) => Response | Promise<Response>,
) {
  const fn = vi.fn(async (input: string | URL | Request, init?: RequestInit) =>
    handler(String(input), init ?? {}),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => vi.unstubAllEnvs());
afterEach(() => vi.unstubAllGlobals());

describe("getDaVinci", () => {
  it("is null unless both URL and secret are set, and strips trailing slashes", async () => {
    expect((await load()).getDaVinci()).toBeNull();
    expect((await load({ DAVINCI_URL: "https://d.example" })).getDaVinci()).toBeNull();
    expect((await load({ DAVINCI_SECRET: SECRET })).getDaVinci()).toBeNull();

    const { getDaVinci, isDaVinciConfigured } = await load({
      DAVINCI_URL: "https://d.example///",
      DAVINCI_SECRET: SECRET,
    });
    expect(isDaVinciConfigured()).toBe(true);
    const fetch = mockFetch(() => Response.json({ llm: true, stt: true, embed: false }));
    await expect(getDaVinci()!.ready()).resolves.toEqual({
      llm: true,
      stt: true,
      embed: false,
    });
    expect(fetch.mock.calls[0]![0]).toBe("https://d.example/readyz");
  });
});

describe("DaVinciClient", () => {
  const env = { DAVINCI_URL: "https://d.example", DAVINCI_SECRET: SECRET };

  it("sends the bearer secret and maps completion usage", async () => {
    const { getDaVinci } = await load(env);
    const fetch = mockFetch(() =>
      Response.json({
        text: "hi",
        json: null,
        model: "Qwen/Qwen3.8-27B",
        usage: { input_tokens: 12, output_tokens: 3 },
      }),
    );
    const res = await getDaVinci()!.complete("heavy", {
      system: "sys",
      prompt: "p",
      temperature: 0.1,
      maxTokens: 42,
    });
    expect(res).toEqual({ text: "hi", usage: { inputTokens: 12, outputTokens: 3 } });
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://d.example/v1/complete");
    expect((init!.headers as Record<string, string>).Authorization).toBe(
      `Bearer ${SECRET}`,
    );
    expect(JSON.parse(init!.body as string)).toEqual({
      system: "sys",
      prompt: "p",
      tier: "heavy",
      temperature: 0.1,
      max_tokens: 42,
    });
  });

  it("forwards json_schema for structured completions and returns the parsed object", async () => {
    const { getDaVinci } = await load(env);
    const fetch = mockFetch(() =>
      Response.json({
        text: '{"ok":true}',
        json: { ok: true },
        model: "m",
        usage: { input_tokens: 1, output_tokens: 1 },
      }),
    );
    const schema = { type: "object", properties: { ok: { type: "boolean" } } };
    const res = await getDaVinci()!.completeStructured<{ ok: boolean }>("everyday", {
      system: "s",
      prompt: "p",
      schema,
      seed: 7,
    });
    expect(res.json).toEqual({ ok: true });
    const body = JSON.parse(fetch.mock.calls[0]![1]!.body as string);
    expect(body.json_schema).toEqual(schema);
    expect(body.seed).toBe(7);
  });

  it("uploads audio as multipart with an extension matching the mime type", async () => {
    const { getDaVinci } = await load(env);
    const fetch = mockFetch(() =>
      Response.json({
        text: " hello ",
        language: "en",
        duration_s: 1,
        segments: [],
        model: "w",
      }),
    );
    const { DaVinciTranscriber } = await import("@/lib/davinci/client");
    const t = new DaVinciTranscriber(getDaVinci()!);
    await expect(t.transcribe(new Uint8Array([1, 2, 3]), "audio/mp4")).resolves.toEqual({
      text: "hello",
    });
    const init = fetch.mock.calls[0]![1]!;
    const form = init.body as FormData;
    expect(form.get("file")).toBeInstanceOf(Blob);
    expect((form.get("file") as File).name).toBe("segment.mp4");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      `Bearer ${SECRET}`,
    );
  });

  it("throws DaVinciUnavailableError on network failure, 401 and 5xx", async () => {
    const { getDaVinci, DaVinciUnavailableError } = await load(env);
    const client = getDaVinci()!;

    mockFetch(() => {
      throw new Error("ECONNREFUSED");
    });
    await expect(client.embed(["a"])).rejects.toBeInstanceOf(DaVinciUnavailableError);

    mockFetch(() => new Response("nope", { status: 401 }));
    await expect(client.embed(["a"])).rejects.toMatchObject({ status: 401 });

    mockFetch(() => new Response("llm: down", { status: 502 }));
    await expect(client.embed(["a"])).rejects.toMatchObject({ status: 502 });
  });
});
