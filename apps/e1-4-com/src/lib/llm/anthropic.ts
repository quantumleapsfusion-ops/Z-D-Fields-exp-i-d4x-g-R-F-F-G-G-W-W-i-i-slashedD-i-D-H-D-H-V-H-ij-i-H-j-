import type { Completion, CompletionRequest, LanguageModel } from "./types";

type AnthropicResponse = {
  content?: { type: string; text?: string }[];
  usage?: { input_tokens?: number; output_tokens?: number };
};

export type AnthropicTransport =
  | { kind: "direct"; apiKey: string }
  | { kind: "gateway"; apiKey: string; baseUrl: string };

export const VERCEL_AI_GATEWAY_URL = "https://ai-gateway.vercel.sh";

/** Anthropic uses `claude-fable-5-1`; the gateway catalogue spells it `claude-fable-5.1`. */
export function toGatewayModelId(model: string): string {
  return model.replace(/-(\d+)-(\d+)$/, "-$1.$2");
}

/**
 * Anthropic Messages API, either direct (`x-api-key`) or via an Anthropic-compatible
 * gateway such as Vercel AI Gateway (`Authorization: Bearer`, models namespaced `anthropic/…`).
 */
export class AnthropicModel implements LanguageModel {
  readonly name: string;
  private readonly endpoint: string;
  private readonly headers: Record<string, string>;
  private readonly wireModel: string;

  constructor(
    transport: AnthropicTransport,
    readonly model: string,
  ) {
    if (transport.kind === "gateway") {
      this.endpoint = `${transport.baseUrl.replace(/\/$/, "")}/v1/messages`;
      this.headers = { authorization: `Bearer ${transport.apiKey}` };
      this.wireModel = model.includes("/")
        ? model
        : `anthropic/${toGatewayModelId(model)}`;
      this.name = `anthropic-gateway:${this.wireModel}`;
    } else {
      this.endpoint = "https://api.anthropic.com/v1/messages";
      this.headers = { "x-api-key": transport.apiKey };
      this.wireModel = model;
      this.name = `anthropic:${model}`;
    }
  }

  async complete({
    system,
    prompt,
    temperature = 0.7,
    maxTokens = 1500,
  }: CompletionRequest): Promise<Completion> {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        ...this.headers,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.wireModel,
        system,
        max_tokens: maxTokens,
        temperature: Math.min(temperature, 1),
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as AnthropicResponse;
    return {
      text: (json.content ?? []).map((c) => c.text ?? "").join(""),
      usage: {
        inputTokens: json.usage?.input_tokens ?? 0,
        outputTokens: json.usage?.output_tokens ?? 0,
      },
    };
  }
}
