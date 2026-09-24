import type { Transcriber } from './types';

export class WhisperTranscriber implements Transcriber {
  readonly name = 'whisper';

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async transcribe(audio: Uint8Array, mimeType: string) {
    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
    const form = new FormData();
    form.append('model', this.model);
    form.append('file', new Blob([new Uint8Array(audio)], { type: mimeType }), `segment.${ext}`);
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    });
    if (!res.ok) throw new Error(`Whisper ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { text?: string };
    return { text: json.text?.trim() ?? '' };
  }
}
