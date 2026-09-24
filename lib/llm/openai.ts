import type { CompletionRequest, LanguageModel } from './types';

type ChatResponse = { choices?: { message?: { content?: string } }[] };

export class OpenAIModel implements LanguageModel {
  readonly name: string;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {
    this.name = `openai:${model}`;
  }

  async complete({ system, prompt, temperature = 0.7, maxTokens = 1500 }: CompletionRequest) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        temperature: Math.min(temperature, 2),
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as ChatResponse;
    return json.choices?.[0]?.message?.content ?? '';
  }
}
