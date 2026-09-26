import type { Completion, CompletionRequest, LanguageModel } from "./types";

type AnthropicResponse = {
  content?: { type: string; text?: string }[];
  usage?: { input_tokens?: number; output_tokens?: number };
};

export class AnthropicModel implements LanguageModel {
  readonly name: string;

  constructor(
    private readonly apiKey: string,
    readonly model: string,
  ) {
    this.name = `anthropic:${model}`;
  }

  async complete({
    system,
    prompt,
    temperature = 0.7,
    maxTokens = 1500,
  }: CompletionRequest): Promise<Completion> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
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
