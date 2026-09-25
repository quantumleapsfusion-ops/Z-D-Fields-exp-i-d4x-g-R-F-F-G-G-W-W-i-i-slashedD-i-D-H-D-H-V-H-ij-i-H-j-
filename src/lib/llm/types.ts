export type CompletionRequest = {
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
};

export type TokenUsage = { inputTokens: number; outputTokens: number };

export type Completion = { text: string; usage: TokenUsage };

/**
 * Which class of work a call belongs to. Decides the model:
 *   everyday → claude-sonnet-5 / claude-haiku-4-5 (Da Vinci summaries, labels, translation)
 *   heavy    → claude-fable-5-1 (Gravity Board superposition, heavy chalkboard breakdowns)
 */
export type ModelTier = "everyday" | "heavy";

/** Text-completion contract shared by Da Vinci, Gravity Board and the chalkboard. */
export interface LanguageModel {
  readonly name: string;
  readonly model: string;
  complete(request: CompletionRequest): Promise<Completion>;
}
