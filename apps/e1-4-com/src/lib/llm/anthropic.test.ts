import { afterEach, describe, expect, it, vi } from "vitest";

import { AnthropicModel, toGatewayModelId } from "./anthropic";

const ok = () =>
  new Response(JSON.stringify({ content: [{ type: "text", text: "pong" }] }), {
    status: 200,
  });

describe("toGatewayModelId", () => {
  it("rewrites a trailing dashed minor version as a dotted one", () => {
    expect(toGatewayModelId("claude-fable-5-1")).toBe("claude-fable-5.1");
    expect(toGatewayModelId("claude-haiku-4-5")).toBe("claude-haiku-4.5");
  });

  it("leaves single-version ids alone", () => {
    expect(toGatewayModelId("claude-sonnet-5")).toBe("claude-sonnet-5");
  });
});

describe("AnthropicModel transports", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("direct: posts to api.anthropic.com with x-api-key and the bare model id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok());
    vi.stubGlobal("fetch", fetchMock);
    const model = new AnthropicModel(
      { kind: "direct", apiKey: "sk-test" },
      "claude-sonnet-5",
    );
    await model.complete({ system: "s", prompt: "ping" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("sk-test");
    expect(JSON.parse(init.body as string).model).toBe("claude-sonnet-5");
    expect(model.name).toBe("anthropic:claude-sonnet-5");
  });

  it("gateway: posts to the gateway with a bearer token and anthropic/ namespaced model", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok());
    vi.stubGlobal("fetch", fetchMock);
    const model = new AnthropicModel(
      { kind: "gateway", apiKey: "vck_test", baseUrl: "https://ai-gateway.vercel.sh/" },
      "claude-fable-5-1",
    );
    const out = await model.complete({ system: "s", prompt: "ping" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(url).toBe("https://ai-gateway.vercel.sh/v1/messages");
    expect(headers.authorization).toBe("Bearer vck_test");
    expect(headers["x-api-key"]).toBeUndefined();
    expect(JSON.parse(init.body as string).model).toBe("anthropic/claude-fable-5.1");
    expect(out.text).toBe("pong");
  });
});
