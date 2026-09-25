import type { CompletionRequest, LanguageModel } from './types';

type AnthropicResponse = { content?: { type: string; text?: string }[] };

export class AnthropicModel implements LanguageModel {
  readonly name: string;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {
    this.name = `anthropic:${model}`;
  }

  async complete({ system, prompt, temperature = 0.7, maxTokens = 1500 }: CompletionRequest) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        system,
        max_tokens: maxTokens,
        temperature: Math.min(temperature, 1),
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as AnthropicResponse;
    return (json.content ?? []).map((c) => c.text ?? '').join('');
  }
}
