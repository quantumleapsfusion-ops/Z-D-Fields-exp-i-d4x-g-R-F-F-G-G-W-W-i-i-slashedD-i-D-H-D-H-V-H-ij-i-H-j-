export type CompletionRequest = {
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
};

/** Text-completion contract shared by Da Vinci and Gravity Board. */
export interface LanguageModel {
  readonly name: string;
  complete(request: CompletionRequest): Promise<string>;
}
