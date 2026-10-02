/**
 * e1-4 5D: Da Vinci, e1-4's own intelligence.
 *
 * Everything in e1-4 that listens, answers or draws goes through these contracts. The gateway that
 * implements them is `apps/davinci` (Python); the client the app uses is
 * `apps/e1-4-com/src/lib/davinci`. No third-party AI SDK belongs in e1-4 product code; a model
 * reaches the app only behind these interfaces. No code runs here.
 */

/** Speech in, text out, for one finished recording. */
export interface Transcriber {
  readonly name: string;
  transcribe(audio: Uint8Array, mimeType: string): Promise<{ text: string }>;
}

export interface CompletionRequest {
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface Completion {
  text: string;
  usage: TokenUsage;
}

/**
 * Which class of work a call belongs to. `everyday` answers people; `heavy` is reserved for the
 * Gravity Board and deep chalkboard work.
 */
export type ModelTier = "everyday" | "heavy";

/** Text in, text out. */
export interface LanguageModel {
  readonly name: string;
  readonly model: string;
  complete(request: CompletionRequest): Promise<Completion>;
}

/** A completion whose shape is enforced, so a feature can rely on the fields. */
export interface StructuredModel extends LanguageModel {
  completeStructured<T>(
    request: CompletionRequest & { schema: Record<string, unknown>; seed?: number },
  ): Promise<Completion & { json: T }>;
}

/** One exchange out loud. */
export interface Turn {
  role: "person" | "davinci";
  text: string;
}

/** What Da Vinci does when spoken to: listens, remembers the conversation, speaks back. */
export interface Companion {
  reply(
    said: string,
    history: Turn[],
  ): Promise<{ reply: string; source: "llm" | "stub" }>;
}

/** Turns speech into a drawing instruction for the chalkboard. */
export interface Draughtsman {
  draw(said: string): Promise<{ tex?: string; text?: string; shape?: string }>;
}
