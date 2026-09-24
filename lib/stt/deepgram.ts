import type { Transcriber } from './types';

type DeepgramResponse = {
  results?: { channels?: { alternatives?: { transcript?: string }[] }[] };
};

export class DeepgramTranscriber implements Transcriber {
  readonly name = 'deepgram';

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async transcribe(audio: Uint8Array, mimeType: string) {
    const url = `https://api.deepgram.com/v1/listen?model=${encodeURIComponent(this.model)}&smart_format=true&punctuate=true`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Token ${this.apiKey}`, 'Content-Type': mimeType },
      body: new Uint8Array(audio),
    });
    if (!res.ok) throw new Error(`Deepgram ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as DeepgramResponse;
    const text = json.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';
    return { text: text.trim() };
  }
}

/** Mints a short-lived JWT (POST /v1/auth/grant) so the browser never sees the API key. */
export async function grantDeepgramToken(apiKey: string, ttlSeconds = 60): Promise<string> {
  const res = await fetch('https://api.deepgram.com/v1/auth/grant', {
    method: 'POST',
    headers: { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ttl_seconds: ttlSeconds }),
  });
  if (!res.ok) throw new Error(`Deepgram grant ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}
