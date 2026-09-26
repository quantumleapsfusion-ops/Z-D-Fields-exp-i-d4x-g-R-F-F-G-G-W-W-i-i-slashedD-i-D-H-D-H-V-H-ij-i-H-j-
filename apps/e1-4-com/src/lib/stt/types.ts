export type TranscriptionResult = { text: string };

/** Batch speech-to-text: one finished audio blob in, text out. */
export interface Transcriber {
  readonly name: string;
  transcribe(audio: Uint8Array, mimeType: string): Promise<TranscriptionResult>;
}

/**
 * How the browser should run live (streaming) transcription.
 * `deepgram`: connect directly to Deepgram's Listen WebSocket with a short-lived token.
 * `browser`: fall back to the Web Speech API (Chrome/Edge/Safari) — no server key needed.
 */
export type LiveTranscriptionConfig =
  { provider: "deepgram"; token: string; model: string } | { provider: "browser" };
