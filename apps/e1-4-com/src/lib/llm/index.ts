import { env } from "@/lib/env";

import { AnthropicModel } from "./anthropic";
import { OpenAIModel } from "./openai";
import type { LanguageModel, ModelTier } from "./types";

export type {
  Completion,
  CompletionRequest,
  LanguageModel,
  ModelTier,
  TokenUsage,
} from "./types";

/**
 * Picks the LLM for a tier. `LLM_PROVIDER` forces a provider; otherwise Anthropic then OpenAI.
 *   everyday → LLM_MODEL_EVERYDAY (default claude-sonnet-5; claude-haiku-4-5 is the cheaper option)
 *   heavy    → LLM_MODEL_HEAVY   (default claude-fable-5-1) — Gravity Board / heavy chalkboard only
 * Returns `null` when no key is configured — callers must render a stub instead of failing.
 */
export function getLanguageModel(tier: ModelTier = "everyday"): LanguageModel | null {
  const { provider, anthropicKey, everydayModel, heavyModel, openaiKey, openaiModel } =
    env.llm;
  if (provider === "none") return null;
  if ((provider === "anthropic" || !provider) && anthropicKey) {
    return new AnthropicModel(
      anthropicKey,
      tier === "heavy" ? heavyModel : everydayModel,
    );
  }
  if ((provider === "openai" || !provider) && openaiKey) {
    return new OpenAIModel(openaiKey, openaiModel);
  }
  return null;
}

/** Extracts the first JSON object/array from a model reply (tolerates prose or code fences). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error("No JSON found in model reply");
  const open = candidate[start];
  const close = open === "[" ? "]" : "}";
  const end = candidate.lastIndexOf(close);
  return JSON.parse(candidate.slice(start, end + 1));
}
